import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { TIME_SLOTS, DAYS_OF_WEEK, getDayName } from '../utils/slots.js';
import { computeProfessorAvailability } from '../utils/availability.js';
import { requireRole } from '../middleware/roles.js';

export const timetableRouter = Router();

const cellSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(),
  day: z.union([z.number(), z.string()]),
  periodIndex: z.union([z.number(), z.string()]),
  timeSlot: z.string().optional(),
  subject: z.string().min(1, 'Subject name required'),
  roomId: z.string().nullable().optional(),
  roomName: z.string().nullable().optional(),
  professorName: z.string().nullable().optional(),
  color: z.string().optional().default('#640000'),
});

const officeHourSchema = z.object({
  day: z.union([z.number(), z.string()]),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean().optional().default(true),
});

const blockedDateSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  reason: z.string().min(1, 'Reason required'),
});

export function formatTimetableEntry(e: any) {
  const dayName = e.dayName || (typeof e.day === 'number' ? DAYS_OF_WEEK[e.day] : e.day) || 'Monday';
  return {
    ...e,
    day: dayName, // string "Monday", "Tuesday" for frontend component compatibility
    dayIndex: typeof e.day === 'number' ? e.day : DAYS_OF_WEEK.indexOf(e.day),
    dayName: dayName,
  };
}

// GET /api/timetable/me
timetableRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const entries = await prisma.timetableEntry.findMany({
      where: { ownerId: userId },
      orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
    });
    res.json({ ownerId: userId, timeSlots: TIME_SLOTS, entries: entries.map(formatTimetableEntry) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// PUT /api/timetable/me/cell
timetableRouter.put('/me/cell', requireAuth, validateBody(cellSchema), async (req: Request, res: Response) => {
  try {
    const ownerId = req.user!.id;
    const { id, day, periodIndex, subject, roomId, roomName, professorName, color } = req.body;

    const dayNum = typeof day === 'string' ? DAYS_OF_WEEK.indexOf(day) : day;
    const cleanDay = dayNum >= 0 ? dayNum : 0;
    const periodNum = parseInt(String(periodIndex), 10);
    const timeSlot = TIME_SLOTS[periodNum] || '8:00-8:50';

    let entry;
    if (id) {
      entry = await prisma.timetableEntry.update({
        where: { id },
        data: {
          day: cleanDay,
          dayName: getDayName(cleanDay),
          periodIndex: periodNum,
          timeSlot,
          subject,
          roomId: roomId || null,
          roomName: roomName || null,
          professorName: professorName || null,
          color: color || '#640000',
        },
      });
    } else {
      // Find existing entry at this day & periodIndex
      const existing = await prisma.timetableEntry.findFirst({
        where: { ownerId, day: cleanDay, periodIndex: periodNum },
      });

      if (existing) {
        entry = await prisma.timetableEntry.update({
          where: { id: existing.id },
          data: {
            subject,
            roomId: roomId || null,
            roomName: roomName || null,
            professorName: professorName || null,
            color: color || '#640000',
          },
        });
      } else {
        entry = await prisma.timetableEntry.create({
          data: {
            ownerId,
            day: cleanDay,
            dayName: getDayName(cleanDay),
            periodIndex: periodNum,
            timeSlot,
            subject,
            roomId: roomId || null,
            roomName: roomName || null,
            professorName: professorName || null,
            color: color || '#640000',
          },
        });
      }
    }

    res.json(formatTimetableEntry(entry));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save timetable cell' });
  }
});

// DELETE /api/timetable/me/cell/:id
timetableRouter.delete('/me/cell/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const entry = await prisma.timetableEntry.findUnique({ where: { id } });
    if (!entry) return res.status(404).json({ error: 'Timetable entry not found' });

    if (entry.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this timetable entry' });
    }

    await prisma.timetableEntry.delete({ where: { id } });
    res.json({ success: true, message: 'Timetable cell removed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete timetable cell' });
  }
});

// POST /api/timetable/me/import
timetableRouter.post('/me/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerId = req.user!.id;
    const { csvData, entries } = req.body;

    let entriesToSave: any[] = [];

    if (Array.isArray(entries)) {
      entriesToSave = entries;
    } else if (typeof csvData === 'string') {
      // Parse CSV: Day, PeriodIndex, Subject, RoomName
      const lines = csvData.trim().split('\n');
      lines.forEach((line) => {
        const parts = line.split(',').map((s) => s.trim());
        if (parts.length >= 3) {
          const dayStr = parts[0];
          const periodIdx = parseInt(parts[1], 10);
          const subject = parts[2];
          const roomName = parts[3] || '';
          const dayNum = DAYS_OF_WEEK.indexOf(dayStr);
          if (dayNum >= 0 && !isNaN(periodIdx)) {
            entriesToSave.push({
              day: dayNum,
              periodIndex: periodIdx,
              subject,
              roomName,
            });
          }
        }
      });
    }

    // Replace current timetable
    await prisma.timetableEntry.deleteMany({ where: { ownerId } });

    const created = [];
    for (const item of entriesToSave) {
      const dayNum = typeof item.day === 'string' ? DAYS_OF_WEEK.indexOf(item.day) : item.day;
      const cleanDay = dayNum >= 0 ? dayNum : 0;
      const pIdx = parseInt(String(item.periodIndex), 10);
      const e = await prisma.timetableEntry.create({
        data: {
          ownerId,
          day: cleanDay,
          dayName: getDayName(cleanDay),
          periodIndex: pIdx,
          timeSlot: TIME_SLOTS[pIdx] || '8:00-8:50',
          subject: item.subject,
          roomId: item.roomId || null,
          roomName: item.roomName || null,
          professorName: item.professorName || null,
          color: item.color || '#640000',
        },
      });
      created.push(e);
    }

    res.json({ success: true, count: created.length, entries: created.map(formatTimetableEntry) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to import timetable' });
  }
});

// GET /api/professors/:id/timetable (public to logged-in users)
timetableRouter.get('/professors/:id/timetable', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const prof = await prisma.user.findUnique({
      where: { id },
      include: { timetableEntries: true },
    });

    if (!prof || prof.role !== 'PROFESSOR') {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json({
      professorId: prof.id,
      professorName: prof.name,
      entries: prof.timetableEntries.map(formatTimetableEntry),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch professor timetable' });
  }
});

// GET /api/professors/:id/availability?date=YYYY-MM-DD
// Computes free and busy slots from professor's classes + office hours + accepted meetings + blocked dates
timetableRouter.get('/professors/:id/availability', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { date } = req.query as { date?: string };

    if (!date) {
      return res.status(400).json({ error: 'Query parameter date (YYYY-MM-DD) is required' });
    }

    const result = await computeProfessorAvailability(id, date);
    if (!result) return res.status(404).json({ error: 'Professor not found' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute availability' });
  }
});

// Professor Office Hours Management
timetableRouter.post('/office-hours', requireAuth, requireRole('PROFESSOR', 'ADMIN'), validateBody(officeHourSchema), async (req: Request, res: Response) => {
  try {
    const profProfile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profProfile) return res.status(403).json({ error: 'Professor profile required' });

    const { day, startTime, endTime, isAvailable } = req.body;
    const dayNum = typeof day === 'string' ? DAYS_OF_WEEK.indexOf(day) : day;

    const created = await prisma.officeHour.create({
      data: {
        professorId: profProfile.id,
        day: dayNum >= 0 ? dayNum : 0,
        dayName: getDayName(dayNum >= 0 ? dayNum : 0),
        startTime,
        endTime,
        isAvailable: isAvailable ?? true,
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add office hour' });
  }
});

timetableRouter.put('/office-hours/:id', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { day, startTime, endTime, isAvailable } = req.body;
    const dayNum = typeof day === 'string' ? DAYS_OF_WEEK.indexOf(day) : day;

    const updated = await prisma.officeHour.update({
      where: { id },
      data: {
        ...(dayNum !== undefined && dayNum >= 0 && { day: dayNum, dayName: getDayName(dayNum) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update office hour' });
  }
});

timetableRouter.delete('/office-hours/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.officeHour.delete({ where: { id } });
    res.json({ success: true, message: 'Office hour deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete office hour' });
  }
});

// Blocked Dates Management
timetableRouter.post('/blocked-dates', requireAuth, requireRole('PROFESSOR', 'ADMIN'), validateBody(blockedDateSchema), async (req: Request, res: Response) => {
  try {
    const profProfile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profProfile) return res.status(403).json({ error: 'Professor profile required' });

    const { date, reason } = req.body;
    const created = await prisma.blockedDate.create({
      data: {
        professorId: profProfile.id,
        date,
        reason,
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to block date' });
  }
});

timetableRouter.put('/blocked-dates/:id', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { date, reason } = req.body;
    const updated = await prisma.blockedDate.update({
      where: { id },
      data: {
        ...(date && { date }),
        ...(reason && { reason }),
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update blocked date' });
  }
});

timetableRouter.delete('/blocked-dates/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blockedDate.delete({ where: { id } });
    res.json({ success: true, message: 'Blocked date removed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove blocked date' });
  }
});

// ==========================================
// BACKWARD COMPATIBILITY ENDPOINTS
// ==========================================
timetableRouter.get('/timetables/:ownerId', requireAuth, async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true, role: true } });
  if (!owner) return res.status(404).json({ error: 'User not found' });

  const isSelf = req.user!.id === ownerId;
  const isAdmin = req.user!.role === 'ADMIN';
  const isProfessorTimetable = owner.role === 'PROFESSOR';
  if (!isSelf && !isAdmin && !isProfessorTimetable) {
    return res.status(403).json({ error: 'Student timetables are private.' });
  }

  const entries = await prisma.timetableEntry.findMany({
    where: { ownerId },
    orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
  });
  res.json({ ownerId, timeSlots: TIME_SLOTS, entries: entries.map(formatTimetableEntry) });
});

timetableRouter.post('/timetables/entry', requireAuth, async (req: Request, res: Response) => {
  const { day, periodIndex, subject, roomId, roomName, professorName, color } = req.body;
  const ownerId = req.user!.role === 'ADMIN' && req.body.ownerId ? req.body.ownerId : req.user!.id;

  const dayNum = typeof day === 'string' ? DAYS_OF_WEEK.indexOf(day) : (day ?? 0);
  const pIdx = parseInt(String(periodIndex || 0), 10);

  const entry = await prisma.timetableEntry.create({
    data: {
      ownerId,
      day: dayNum >= 0 ? dayNum : 0,
      dayName: getDayName(dayNum >= 0 ? dayNum : 0),
      periodIndex: pIdx,
      timeSlot: TIME_SLOTS[pIdx] || '8:00-8:50',
      subject: subject || 'Academic Class',
      roomId: roomId || null,
      roomName: roomName || null,
      professorName: professorName || null,
      color: color || '#640000',
    },
  });
  res.json(formatTimetableEntry(entry));
});

timetableRouter.delete('/timetables/entry/:id', requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const entry = await prisma.timetableEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ error: 'Timetable entry not found' });
  if (entry.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  await prisma.timetableEntry.delete({ where: { id } });
  res.json({ success: true });
});

timetableRouter.post('/timetables/bulk', requireAuth, async (req: Request, res: Response) => {
  const { entries } = req.body;
  const ownerId = req.user!.role === 'ADMIN' && req.body.ownerId ? req.body.ownerId : req.user!.id;
  if (!ownerId || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'ownerId and entries required' });
  }

  await prisma.timetableEntry.deleteMany({ where: { ownerId } });
  const created = [];
  for (const e of entries) {
    const dayNum = typeof e.day === 'string' ? DAYS_OF_WEEK.indexOf(e.day) : (e.day ?? 0);
    const pIdx = parseInt(String(e.periodIndex || 0), 10);
    const item = await prisma.timetableEntry.create({
      data: {
        ownerId,
        day: dayNum >= 0 ? dayNum : 0,
        dayName: getDayName(dayNum >= 0 ? dayNum : 0),
        periodIndex: pIdx,
        timeSlot: TIME_SLOTS[pIdx] || '8:00-8:50',
        subject: e.subject || 'Class',
        roomId: e.roomId || null,
        roomName: e.roomName || null,
        professorName: e.professorName || null,
        color: e.color || '#640000',
      },
    });
    created.push(item);
  }
  res.json(created.map(formatTimetableEntry));
});
