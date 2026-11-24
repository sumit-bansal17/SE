import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { uploadAttachment, uploadsDir } from '../middleware/upload.js';
import { logAudit } from '../utils/audit.js';
import { createNotification } from '../utils/notification.js';
import { getDayOfWeekIndex, getSlotStartEnd, TIME_SLOTS } from '../utils/slots.js';

export const requestsRouter = Router();

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'RESCHEDULE_PROPOSED', 'PENDING'],
  RESCHEDULE_PROPOSED: ['PENDING', 'CANCELLED', 'ACCEPTED'],
  ACCEPTED: ['CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
};

function assertTransition(from: string, to: string) {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    const err: any = new Error(`Invalid status transition: ${from} → ${to}`);
    err.status = 409;
    throw err;
  }
}

function formatRequest(r: any) {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.student?.name || 'Student',
    studentRoll: r.student?.studentProfile?.rollNo || '',
    studentBranch: r.student?.studentProfile?.branch || '',
    professorId: r.professorId,
    professorName: r.professor?.name || 'Faculty Member',
    date: r.date,
    timeSlot: r.timeSlot || `${r.startTime}-${r.endTime}`,
    startTime: r.startTime,
    endTime: r.endTime,
    reason: r.reason,
    type: r.meetingType === 'DOUBT' ? 'Doubt' : r.meetingType === 'PROJECT' ? 'Project discussion' : r.meetingType === 'GUIDANCE' ? 'Guidance' : 'Other',
    meetingType: r.meetingType,
    attachmentUrl: r.attachmentUrl,
    attachmentName: r.attachmentName,
    attachmentSize: r.attachmentSize,
    status: r.status.toLowerCase(), // frontend expects 'pending', 'accepted', 'rejected', 'cancelled'
    rawStatus: r.status,
    professorRemark: r.professorRemark,
    proposedDate: r.proposedDate,
    proposedSlot: r.proposedSlot,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/**
 * Validates whether a time slot has a conflict with classes, blocked dates, or accepted meetings
 */
async function checkConflictInternal(professorId: string, studentId: string | undefined, date: string, timeSlot: string) {
  // 1. Check if date is in the past
  const todayStr = new Date().toISOString().split('T')[0];
  if (date < todayStr) {
    return { hasConflict: true, type: 'PAST_DATE', reason: 'Meeting date must be in the future.' };
  }

  const dayIndex = getDayOfWeekIndex(date);
  const periodIndex = TIME_SLOTS.indexOf(timeSlot);

  // 2. Check Professor Blocked Dates
  const prof = await prisma.user.findUnique({
    where: { id: professorId },
    include: {
      professorProfile: {
        include: { blockedDates: true, officeHours: true },
      },
      timetableEntries: {
        where: { day: dayIndex },
      },
    },
  });

  if (!prof) {
    return { hasConflict: true, type: 'NOT_FOUND', reason: 'Professor not found.' };
  }

  const blocked = prof.professorProfile?.blockedDates.find((b) => b.date === date);
  if (blocked) {
    return {
      hasConflict: true,
      type: 'PROFESSOR_BLOCKED',
      reason: `Professor is unavailable on this date (${blocked.reason}).`,
    };
  }

  // 3. Check Professor Teaching Classes at this period
  if (periodIndex >= 0) {
    const profClass = prof.timetableEntries.find((t) => t.periodIndex === periodIndex);
    if (profClass) {
      return {
        hasConflict: true,
        type: 'PROFESSOR_CLASS_CONFLICT',
        reason: `Professor is teaching "${profClass.subject}" at this period.`,
      };
    }
  }

  // 4. Check Professor already has an ACCEPTED meeting at this slot
  const profAcceptedMeeting = await prisma.meetingRequest.findFirst({
    where: {
      professorId,
      date,
      timeSlot,
      status: 'ACCEPTED',
    },
  });

  if (profAcceptedMeeting) {
    return {
      hasConflict: true,
      type: 'PROFESSOR_MEETING_BUSY',
      reason: 'This consultation slot is already booked and confirmed with another student.',
    };
  }

  // 5. Check Student's own class schedule conflict (if studentId provided)
  if (studentId && periodIndex >= 0) {
    const studentClass = await prisma.timetableEntry.findFirst({
      where: {
        ownerId: studentId,
        day: dayIndex,
        periodIndex,
      },
    });

    if (studentClass) {
      return {
        hasConflict: true,
        type: 'STUDENT_CLASS_CONFLICT',
        reason: `You have a scheduled academic class "${studentClass.subject}" at this time.`,
      };
    }
  }

  return { hasConflict: false };
}

// GET /api/requests/check-conflict
requestsRouter.get('/check-conflict', requireAuth, async (req: Request, res: Response) => {
  const { professorId, studentId, date, timeSlot } = req.query as {
    professorId?: string;
    studentId?: string;
    date?: string;
    timeSlot?: string;
  };

  if (!professorId || !date || !timeSlot) {
    return res.status(400).json({ error: 'professorId, date, and timeSlot required' });
  }

  const result = await checkConflictInternal(professorId, studentId, date, timeSlot);
  res.json(result);
});

// GET /api/requests (supports filtering by userId, role, status)
requestsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, role, status } = req.query as { userId?: string; role?: string; status?: string };

    const where: any = {};
    const actorRole = req.user!.role.toUpperCase();

    if (actorRole === 'ADMIN') {
      if (userId) {
        if (role === 'professor') where.professorId = userId;
        else if (role === 'student') where.studentId = userId;
        else where.OR = [{ studentId: userId }, { professorId: userId }];
      }
    } else if (actorRole === 'PROFESSOR') {
      where.professorId = req.user!.id;
    } else {
      where.studentId = req.user!.id;
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const requests = await prisma.meetingRequest.findMany({
      where,
      include: {
        student: { include: { studentProfile: true } },
        professor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests.map(formatRequest));
  } catch (err: any) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch meeting requests' });
  }
});

// GET /api/requests/mine (Student's own requests)
requestsRouter.get('/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const where: any = { studentId: req.user!.id };
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const requests = await prisma.meetingRequest.findMany({
      where,
      include: {
        student: { include: { studentProfile: true } },
        professor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests.map(formatRequest));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

// GET /api/requests/incoming (Professor's incoming requests)
requestsRouter.get('/incoming', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const where: any = { professorId: req.user!.id };
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const requests = await prisma.meetingRequest.findMany({
      where,
      include: {
        student: { include: { studentProfile: true } },
        professor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests.map(formatRequest));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
});

// POST /api/requests (Student books meeting, multipart with optional project idea file)
requestsRouter.post('/', requireAuth, requireRole('STUDENT', 'ADMIN'), uploadAttachment.single('attachment'), async (req: Request, res: Response) => {
  try {
    const {
      professorId,
      date,
      timeSlot,
      reason,
      type,
    } = req.body;

    const studentId = req.user!.role === 'ADMIN' && req.body.studentId ? req.body.studentId : req.user!.id;
    if (!studentId || !professorId || !date || !timeSlot || !reason) {
      return res.status(400).json({
        error: 'Missing mandatory fields: studentId, professorId, date, timeSlot, and reason are required.',
      });
    }

    // Enforce Conflict Validation Rule
    const conflict = await checkConflictInternal(professorId, studentId, date, timeSlot);
    if (conflict.hasConflict) {
      return res.status(409).json({ error: conflict.reason, conflictType: conflict.type });
    }

    let attachmentUrl = null;
    let attachmentName = null;
    let attachmentSize = 0;

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
      attachmentSize = Math.round((req.file.size / (1024 * 1024)) * 100) / 100;
    }

    const slotHours = getSlotStartEnd(timeSlot);

    let meetingType = 'DOUBT';
    const typeUpper = (type || '').toUpperCase();
    if (typeUpper.includes('PROJECT')) meetingType = 'PROJECT';
    else if (typeUpper.includes('GUIDANCE')) meetingType = 'GUIDANCE';
    else if (typeUpper.includes('OTHER')) meetingType = 'OTHER';

    const meeting = await prisma.meetingRequest.create({
      data: {
        studentId,
        professorId,
        date,
        timeSlot,
        startTime: slotHours.start,
        endTime: slotHours.end,
        reason,
        meetingType,
        attachmentUrl,
        attachmentName,
        attachmentSize,
        status: 'PENDING',
      },
      include: {
        student: { include: { studentProfile: true } },
        professor: true,
      },
    });

    // Notify professor
    await createNotification({
      userId: professorId,
      type: 'REQUEST',
      title: 'New Meeting Request',
      message: `${meeting.student.name} requested a consultation on ${date} (${timeSlot}) regarding: "${reason.slice(0, 45)}..."`,
      link: '/requests',
    });

    // Write Audit Log
    await logAudit({
      actorId: studentId,
      actorName: meeting.student.name,
      actorRole: 'STUDENT',
      action: 'REQUEST_SUBMITTED',
      entity: 'MeetingRequest',
      entityId: meeting.id,
      details: `Meeting requested with ${meeting.professor.name} for ${date} at ${timeSlot}`,
    });

    res.status(201).json(formatRequest(meeting));
  } catch (err: any) {
    console.error('Error creating meeting request:', err);
    res.status(500).json({ error: err.message || 'Server error while submitting request' });
  }
});

// PATCH /api/requests/:id/accept (Professor only, with transactional concurrency check to prevent double booking)
requestsRouter.patch('/:id/accept', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Run within a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.meetingRequest.findUnique({
        where: { id },
        include: { student: true, professor: true },
      });

      if (!existing) {
        throw new Error('NOT_FOUND: Meeting request not found');
      }

      if (req.user!.role !== 'ADMIN' && existing.professorId !== req.user!.id) {
        throw new Error('FORBIDDEN: Only the addressed professor can accept this request');
      }

      assertTransition(existing.status, 'ACCEPTED');

      // Check double booking for that professor on that date & slot
      const existingAccepted = await tx.meetingRequest.findFirst({
        where: {
          professorId: existing.professorId,
          date: existing.date,
          timeSlot: existing.timeSlot,
          status: 'ACCEPTED',
          id: { not: existing.id },
        },
      });

      if (existingAccepted) {
        throw new Error('DOUBLE_BOOKING: This slot has already been booked by another student.');
      }

      // Update to ACCEPTED
      const updated = await tx.meetingRequest.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          professorRemark: req.body.professorRemark || 'Approved by faculty member.',
        },
        include: { student: { include: { studentProfile: true } }, professor: true },
      });

      return updated;
    });

    // Notify student
    await createNotification({
      userId: result.studentId,
      type: 'REQUEST',
      title: 'Meeting Accepted',
      message: `${result.professor.name} accepted your consultation request for ${result.date} (${result.timeSlot}).`,
      link: '/requests',
    });

    await logAudit({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: 'PROFESSOR',
      action: 'REQUEST_ACCEPTED',
      entity: 'MeetingRequest',
      entityId: result.id,
      details: `Accepted request #${result.id} from ${result.student.name} for ${result.date} at ${result.timeSlot}`,
    });

    res.json(formatRequest(result));
  } catch (err: any) {
    if (err.message.startsWith('DOUBLE_BOOKING')) {
      return res.status(409).json({ error: err.message.replace('DOUBLE_BOOKING: ', '') });
    }
    if (err.message.startsWith('NOT_FOUND')) {
      return res.status(404).json({ error: err.message.replace('NOT_FOUND: ', '') });
    }
    if (err.message.startsWith('FORBIDDEN')) {
      return res.status(403).json({ error: err.message.replace('FORBIDDEN: ', '') });
    }
    res.status(500).json({ error: err.message || 'Failed to accept request' });
  }
});

// PATCH /api/requests/:id/reject (Professor only)
requestsRouter.patch('/:id/reject', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    if (req.user!.role !== 'ADMIN' && existing.professorId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      assertTransition(existing.status, 'REJECTED');
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

    const { remark } = req.body;
    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        professorRemark: remark || req.body.professorRemark || 'Declined by professor',
      },
      include: { student: { include: { studentProfile: true } }, professor: true },
    });

    await createNotification({
      userId: existing.studentId,
      type: 'REQUEST',
      title: 'Meeting Declined',
      message: `${existing.professor.name} declined your consultation request. Remark: ${remark || 'Not available'}`,
      link: '/requests',
    });

    await logAudit({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: 'PROFESSOR',
      action: 'REQUEST_REJECTED',
      entity: 'MeetingRequest',
      entityId: existing.id,
      details: `Declined request #${existing.id} with remark: ${remark || 'No remark'}`,
    });

    res.json(formatRequest(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reject request' });
  }
});

// PATCH /api/requests/:id/suggest-time (Professor proposes alternate slot)
requestsRouter.patch('/:id/suggest-time', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { proposedDate, proposedSlot, proposedStart, proposedEnd, remark } = req.body;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    if (req.user!.role !== 'ADMIN' && existing.professorId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the addressed professor can propose a new time' });
    }

    try {
      assertTransition(existing.status, 'RESCHEDULE_PROPOSED');
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status: 'RESCHEDULE_PROPOSED',
        proposedDate: proposedDate || existing.date,
        proposedSlot: proposedSlot || existing.timeSlot,
        proposedStart: proposedStart || null,
        proposedEnd: proposedEnd || null,
        professorRemark: remark || `Proposed alternate slot: ${proposedDate} at ${proposedSlot}`,
      },
      include: { student: { include: { studentProfile: true } }, professor: true },
    });

    await createNotification({
      userId: existing.studentId,
      type: 'REQUEST',
      title: 'Reschedule Proposed',
      message: `${existing.professor.name} proposed an alternate consultation time on ${proposedDate} (${proposedSlot}).`,
      link: '/requests',
    });

    res.json(formatRequest(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to propose reschedule' });
  }
});

// PATCH /api/requests/:id/respond-reschedule (Student accepts or declines proposed time)
requestsRouter.patch('/:id/respond-reschedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { accept } = req.body;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    if (existing.studentId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the requesting student can respond to reschedule proposals' });
    }

    if (existing.status !== 'RESCHEDULE_PROPOSED') {
      return res.status(409).json({ error: 'No reschedule proposal is pending for this request' });
    }

    if (accept) {
      const updated = await prisma.meetingRequest.update({
        where: { id },
        data: {
          status: 'PENDING',
          date: existing.proposedDate || existing.date,
          timeSlot: existing.proposedSlot || existing.timeSlot,
          proposedDate: null,
          proposedSlot: null,
        },
        include: { student: { include: { studentProfile: true } }, professor: true },
      });
      res.json(formatRequest(updated));
    } else {
      const updated = await prisma.meetingRequest.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { student: { include: { studentProfile: true } }, professor: true },
      });
      res.json(formatRequest(updated));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to respond to reschedule' });
  }
});

// PATCH /api/requests/:id/reschedule (Student updates time while pending)
requestsRouter.patch('/:id/reschedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { newDate, newSlot } = req.body;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    if (existing.studentId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(409).json({ error: 'Only pending requests can be rescheduled by the student' });
    }

    const conflict = await checkConflictInternal(existing.professorId, existing.studentId, newDate, newSlot);
    if (conflict.hasConflict) {
      return res.status(409).json({ error: conflict.reason });
    }

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        date: newDate,
        timeSlot: newSlot,
        status: 'PENDING',
      },
      include: { student: { include: { studentProfile: true } }, professor: true },
    });

    await createNotification({
      userId: existing.professorId,
      type: 'REQUEST',
      title: 'Request Rescheduled',
      message: `${existing.student.name} rescheduled consultation to ${newDate} (${newSlot}).`,
      link: '/requests',
    });

    res.json(formatRequest(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reschedule request' });
  }
});

// PATCH /api/requests/:id/cancel (Student cancels request)
requestsRouter.patch('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    if (existing.studentId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the requesting student can cancel this request' });
    }

    try {
      assertTransition(existing.status, 'CANCELLED');
    } catch (e: any) {
      return res.status(409).json({ error: e.message });
    }

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { student: { include: { studentProfile: true } }, professor: true },
    });

    await logAudit({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      action: 'REQUEST_CANCELLED',
      entity: 'MeetingRequest',
      entityId: existing.id,
      details: `Cancelled consultation request #${existing.id}`,
    });

    res.json(formatRequest(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel request' });
  }
});

// GET /api/requests/:id/attachment (Secure file download)
requestsRouter.get('/:id/attachment', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const request = await prisma.meetingRequest.findUnique({ where: { id } });
    if (!request || !request.attachmentUrl) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Authorization check: student, professor, or admin
    if (
      req.user!.role !== 'ADMIN' &&
      req.user!.id !== request.studentId &&
      req.user!.id !== request.professorId
    ) {
      return res.status(403).json({ error: 'You are not authorized to download this file.' });
    }

    const filename = path.basename(request.attachmentUrl);
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File on disk not found' });
    }

    res.download(filePath, request.attachmentName || filename);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

// General update endpoint for backward compatibility with frontend: PATCH /api/requests/:id
requestsRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, professorRemark, rescheduledSlot, rescheduledDate, date, timeSlot } = req.body;
    const existing = await prisma.meetingRequest.findUnique({
      where: { id },
      include: { student: true, professor: true },
    });
    if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

    // Double booking check if accepting
    if (status === 'accepted' || status === 'ACCEPTED') {
      const conflict = await checkConflictInternal(existing.professorId, existing.studentId, existing.date, existing.timeSlot || '');
      if (conflict.hasConflict && conflict.type === 'PROFESSOR_MEETING_BUSY') {
        return res.status(409).json({ error: conflict.reason });
      }
    }

    const data: any = {};
    if (status) data.status = status.toUpperCase();
    if (professorRemark !== undefined) data.professorRemark = professorRemark;
    if (rescheduledDate) data.date = rescheduledDate;
    if (rescheduledSlot) data.timeSlot = rescheduledSlot;

    const updated = await prisma.meetingRequest.update({
      where: { id },
      data,
      include: { student: { include: { studentProfile: true } }, professor: true },
    });

    // Notify if status changed
    if (status === 'accepted' || status === 'ACCEPTED') {
      await createNotification({
        userId: existing.studentId,
        type: 'REQUEST',
        title: 'Meeting Accepted',
        message: `${existing.professor.name} accepted your consultation request for ${existing.date} (${existing.timeSlot}).`,
        link: '/requests',
      });
      await logAudit({
        actorId: existing.professorId,
        actorName: existing.professor.name,
        actorRole: 'PROFESSOR',
        action: 'REQUEST_ACCEPTED',
        entity: 'MeetingRequest',
        entityId: existing.id,
        details: `Accepted request #${existing.id} from student ${existing.student.name}`,
      });
    } else if (status === 'rejected' || status === 'REJECTED') {
      await createNotification({
        userId: existing.studentId,
        type: 'REQUEST',
        title: 'Meeting Declined',
        message: `${existing.professor.name} declined your meeting request. Reason: ${professorRemark || 'Not available'}`,
        link: '/requests',
      });
      await logAudit({
        actorId: existing.professorId,
        actorName: existing.professor.name,
        actorRole: 'PROFESSOR',
        action: 'REQUEST_REJECTED',
        entity: 'MeetingRequest',
        entityId: existing.id,
        details: `Declined request #${existing.id} with remark: ${professorRemark}`,
      });
    } else if (status === 'cancelled' || status === 'CANCELLED') {
      await logAudit({
        actorId: existing.studentId,
        actorName: existing.student.name,
        actorRole: 'STUDENT',
        action: 'REQUEST_CANCELLED',
        entity: 'MeetingRequest',
        entityId: existing.id,
        details: `Cancelled consultation request #${existing.id}`,
      });
    }

    res.json(formatRequest(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update meeting request' });
  }
});
