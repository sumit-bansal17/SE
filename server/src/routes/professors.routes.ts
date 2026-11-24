import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { logAudit } from '../utils/audit.js';
import { computeProfessorAvailability } from '../utils/availability.js';

export const professorsRouter = Router();

const updateMeSchema = z.object({
  bio: z.string().optional(),
  researchAreas: z.string().optional(),
  research: z.string().optional(),
  officeLocation: z.string().optional(),
  isOnline: z.boolean().optional(),
});

function formatProfessorCard(user: any) {
  const p = user.professorProfile;
  const officeHoursStr = p?.officeHours
    ? p.officeHours.map((oh: any) => `${oh.dayName}: ${oh.startTime} - ${oh.endTime}`).join(' | ')
    : 'Mon & Wed: 03:00 PM - 05:00 PM';

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'professor',
    avatar: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    status: user.status,
    profile: {
      teacherCode: p?.teacherCode || 'TCH-001',
      department: p?.department?.name || 'CSED',
      designation: p?.designation || 'ASSOCIATE',
      officeLocation: p?.officeLocation || 'Block C, Faculty Wing',
      bio: p?.bio || '',
      officeHours: officeHoursStr,
      officeHoursList: p?.officeHours || [],
      research: p?.researchAreas || '',
      researchAreas: p?.researchAreas || '',
      isOnline: p ? p.isOnline : true,
    },
  };
}

// GET /api/professors (Search, filter by department, sort)
professorsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, department, sort } = req.query as { search?: string; department?: string; sort?: string };

    const whereClause: any = {
      role: 'PROFESSOR',
      status: 'ACTIVE',
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { professorProfile: { teacherCode: { contains: search } } },
        { professorProfile: { researchAreas: { contains: search } } },
      ];
    }

    if (department && department !== 'All' && department !== 'all') {
      whereClause.professorProfile = {
        ...whereClause.professorProfile,
        department: {
          name: { equals: department },
        },
      };
    }

    let orderBy: any = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'recent') orderBy = { createdAt: 'desc' };

    const professors = await prisma.user.findMany({
      where: whereClause,
      include: {
        professorProfile: {
          include: { department: true, officeHours: true },
        },
      },
      orderBy,
    });

    res.json(professors.map(formatProfessorCard));
  } catch (err: any) {
    console.error('Failed to fetch professors:', err);
    res.status(500).json({ error: 'Failed to retrieve professors directory' });
  }
});

// GET /api/professors/:id/availability
professorsRouter.get('/:id/availability', requireAuth, async (req: Request, res: Response) => {
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

// PATCH /api/professors/me (professor edits own profile) — registered before /:id
professorsRouter.patch('/me', requireAuth, requireRole('PROFESSOR'), validateBody(updateMeSchema), async (req: Request, res: Response) => {
  try {
    const { bio, researchAreas, research, officeLocation, isOnline } = req.body;
    const areas = researchAreas || research;

    const updatedProfile = await prisma.professorProfile.update({
      where: { userId: req.user!.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(areas !== undefined && { researchAreas: areas }),
        ...(officeLocation !== undefined && { officeLocation }),
        ...(isOnline !== undefined && { isOnline }),
      },
      include: { department: true, officeHours: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        professorProfile: { include: { department: true, officeHours: true } },
      },
    });

    await logAudit({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: 'PROFESSOR',
      action: 'PROFESSOR_PROFILE_UPDATED',
      entity: 'ProfessorProfile',
      entityId: updatedProfile.id,
      details: 'Professor updated their public academic profile',
    });

    res.json(formatProfessorCard(user));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update professor profile' });
  }
});

// GET /api/professors/:id
professorsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const prof = await prisma.user.findUnique({
      where: { id },
      include: {
        professorProfile: {
          include: { department: true, officeHours: true, blockedDates: true },
        },
        timetableEntries: true,
      },
    });

    if (!prof || prof.role !== 'PROFESSOR') {
      return res.status(404).json({ error: 'Professor not found' });
    }

    const card = formatProfessorCard(prof);
    res.json({
      ...card,
      timetable: prof.timetableEntries,
      blockedDates: prof.professorProfile?.blockedDates || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching professor profile' });
  }
});
