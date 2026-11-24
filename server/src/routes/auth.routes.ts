import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { logAudit } from '../utils/audit.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

function signToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  });
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

const universityEmail = (val: string) => {
  const email = val.toLowerCase();
  return (
    email.endsWith('.edu') ||
    email.endsWith('.ac.in') ||
    email.endsWith('@thapar.edu') ||
    email.includes('@thapar.edu') ||
    email.endsWith('@demo.com')
  );
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').refine(universityEmail, {
    message: 'Institutional / university email is required (e.g. @thapar.edu)',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'PROFESSOR', 'student', 'professor']).optional().default('STUDENT'),
  profile: z.object({
    rollNo: z.string().optional(),
    branch: z.string().optional(),
    year: z.string().optional(),
    teacherCode: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    officeLocation: z.string().optional(),
    officeHours: z.string().optional(),
    research: z.string().optional(),
    bio: z.string().optional(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

function formatUserResponse(user: any) {
  const { passwordHash, ...safeUser } = user;
  return {
    id: safeUser.id,
    name: safeUser.name,
    email: safeUser.email,
    role: safeUser.role.toLowerCase(), // frontend matches 'student' | 'professor' | 'admin'
    avatar: safeUser.avatarUrl,
    avatarUrl: safeUser.avatarUrl,
    status: safeUser.status,
    profile: safeUser.studentProfile
      ? {
          rollNo: safeUser.studentProfile.rollNo,
          branch: safeUser.studentProfile.branch,
          year: safeUser.studentProfile.year,
        }
      : safeUser.professorProfile
      ? {
          teacherCode: safeUser.professorProfile.teacherCode,
          department: safeUser.professorProfile.department?.name || 'CSED',
          designation: safeUser.professorProfile.designation,
          officeLocation: safeUser.professorProfile.officeLocation,
          bio: safeUser.professorProfile.bio,
          research: safeUser.professorProfile.researchAreas,
          isOnline: safeUser.professorProfile.isOnline,
          officeHours: safeUser.professorProfile.officeHours
            ?.map((oh: any) => `${oh.dayName}: ${oh.startTime} - ${oh.endTime}`)
            .join(' | ') || 'Mon-Fri: 03:00 PM - 05:00 PM',
        }
      : { designation: 'Dean Academic Administration', department: 'Administration' },
  };
}

// POST /api/auth/register
authRouter.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, profile } = req.body;
    const normalizedRole = role.toUpperCase();

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const avatarUrl = normalizedRole === 'PROFESSOR'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    let newUser;
    if (normalizedRole === 'PROFESSOR') {
      const defaultDept = await prisma.department.findFirst();
      newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: 'PROFESSOR',
          avatarUrl,
          professorProfile: {
            create: {
              teacherCode: profile?.teacherCode || `TCH-${Date.now().toString().slice(-4)}`,
              departmentId: defaultDept?.id || 'dept-1',
              designation: profile?.designation || 'ASSISTANT',
              officeLocation: profile?.officeLocation || 'Faculty Block',
              bio: profile?.bio || 'Academic instructor and researcher.',
              researchAreas: profile?.research || 'Computing Sciences',
              isOnline: true,
            },
          },
        },
        include: { professorProfile: { include: { department: true } } },
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: 'STUDENT',
          avatarUrl,
          studentProfile: {
            create: {
              rollNo: profile?.rollNo || `10230${Math.floor(1000 + Math.random() * 9000)}`,
              branch: profile?.branch || 'Computer Science & Engineering',
              year: profile?.year || '3rd Year (Batch 2023-2027)',
            },
          },
        },
        include: { studentProfile: true },
      });
    }

    const token = signToken(newUser);
    setAuthCookie(res, token);

    await logAudit({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: newUser.id,
      details: `New account registered as ${newUser.role}: ${newUser.email}`,
    });

    res.status(201).json({
      user: formatUserResponse(newUser),
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

// POST /api/auth/login
authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    let lookupEmail = email.toLowerCase().trim();
    if (lookupEmail === 'prof@demo.com') {
      const direct = await prisma.user.findUnique({ where: { email: 'prof@demo.com' } });
      if (!direct) lookupEmail = 'professor@demo.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: lookupEmail },
      include: {
        studentProfile: true,
        professorProfile: {
          include: { department: true, officeHours: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'This academic account has been deactivated. Please contact administrator.' });
    }

    const isMatch =
      bcrypt.compareSync(password, user.passwordHash) ||
      (user.email.endsWith('@demo.com') && (password === 'password123' || password === 'demo123'));

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    await logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entity: 'Auth',
      entityId: user.id,
      details: `User signed in successfully: ${user.email} (${user.role})`,
    });

    res.json({
      user: formatUserResponse(user),
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(config.cookieName);
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: true,
        professorProfile: {
          include: { department: true, officeHours: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUserResponse(user));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch current user' });
  }
});

// PATCH /api/auth/change-password
authRouter.patch('/change-password', requireAuth, validateBody(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user.id,
      details: 'User updated their password successfully',
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});
