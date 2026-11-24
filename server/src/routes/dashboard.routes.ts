import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { getDayOfWeekIndex, getDayName, TIME_SLOTS } from '../utils/slots.js';

export const dashboardRouter = Router();

// GET /api/dashboard/student
dashboardRouter.get('/student', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDayIndex = getDayOfWeekIndex(todayStr);

    // Today's classes
    const todayClasses = await prisma.timetableEntry.findMany({
      where: { ownerId: studentId, day: todayDayIndex },
      orderBy: { periodIndex: 'asc' },
    });

    // Pending tasks
    const pendingTasks = await prisma.task.findMany({
      where: { userId: studentId, done: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Student's consultation requests
    const activeRequests = await prisma.meetingRequest.findMany({
      where: { studentId },
      include: { professor: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recent activity (Audit logs & notifications)
    const recentActivity = await prisma.notification.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Next upcoming class determination
    const nextClass = todayClasses.length > 0 ? todayClasses[0] : null;

    res.json({
      dayName: getDayName(todayDayIndex),
      date: todayStr,
      todayClasses,
      nextClass,
      pendingTasks: pendingTasks.map((t) => ({
        id: t.id,
        label: t.title,
        sub: t.dueDate || 'Academic Work',
        category: t.category,
        done: t.done,
      })),
      activeRequests,
      recentActivity,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate student dashboard summary' });
  }
});

// GET /api/dashboard/professor
dashboardRouter.get('/professor', requireAuth, async (req: Request, res: Response) => {
  try {
    const profId = req.user!.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDayIndex = getDayOfWeekIndex(todayStr);

    // Today's classes
    const todayClasses = await prisma.timetableEntry.findMany({
      where: { ownerId: profId, day: todayDayIndex },
      orderBy: { periodIndex: 'asc' },
    });

    // Today's accepted meetings
    const todayMeetings = await prisma.meetingRequest.findMany({
      where: {
        professorId: profId,
        date: todayStr,
        status: 'ACCEPTED',
      },
      include: { student: true },
      orderBy: { timeSlot: 'asc' },
    });

    // Pending incoming meeting requests count
    const pendingRequestsCount = await prisma.meetingRequest.count({
      where: { professorId: profId, status: 'PENDING' },
    });

    // Recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: { userId: profId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      dayName: getDayName(todayDayIndex),
      date: todayStr,
      todayClasses,
      todayMeetings,
      pendingRequestsCount,
      recentNotifications,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate professor dashboard summary' });
  }
});

// GET /api/dashboard/admin
dashboardRouter.get('/admin', requireAuth, async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalProfessors, totalClassrooms, totalDepartments, requestsByStatus, recentLogs] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'PROFESSOR', status: 'ACTIVE' } }),
      prisma.classroom.count(),
      prisma.department.count(),
      prisma.meetingRequest.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const statusCounts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      reschedule_proposed: 0,
    };

    requestsByStatus.forEach((r) => {
      statusCounts[r.status.toLowerCase()] = r._count.status;
    });

    res.json({
      totals: {
        students: totalStudents,
        professors: totalProfessors,
        classrooms: totalClassrooms,
        departments: totalDepartments,
      },
      requestsByStatus: statusCounts,
      recentAuditLogs: recentLogs,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate admin dashboard summary' });
  }
});
