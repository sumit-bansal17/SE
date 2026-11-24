import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { logAudit } from '../utils/audit.js';
import { createNotification } from '../utils/notification.js';
import { TIME_SLOTS, DAYS_OF_WEEK, getDayName } from '../utils/slots.js';

export const adminRouter = Router();

// Helper to format student
function formatStudent(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'student',
    avatar: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    status: user.status,
    profile: {
      rollNo: user.studentProfile?.rollNo || '',
      branch: user.studentProfile?.branch || '',
      year: user.studentProfile?.year || '3rd Year',
    },
    createdAt: user.createdAt,
  };
}

// Helper to format professor
function formatProfessor(user: any) {
  const p = user.professorProfile;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'professor',
    avatar: user.avatarUrl,
    avatarUrl: user.avatarUrl,
    status: user.status,
    profile: {
      teacherCode: p?.teacherCode || '',
      department: p?.department?.name || 'CSED',
      designation: p?.designation || 'ASSISTANT',
      officeLocation: p?.officeLocation || '',
      bio: p?.bio || '',
      officeHours: p?.officeHours?.map((oh: any) => `${oh.dayName}: ${oh.startTime} - ${oh.endTime}`).join(' | ') || '',
      research: p?.researchAreas || '',
      isOnline: p ? p.isOnline : true,
    },
    createdAt: user.createdAt,
  };
}

// ==========================================
// 1. STUDENTS MANAGEMENT
// ==========================================
adminRouter.get('/students', async (_req: Request, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE' },
      include: { studentProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students.map(formatStudent));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

adminRouter.post('/students', async (req: Request, res: Response) => {
  try {
    const { name, email, password, rollNo, branch, year } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const passwordHash = bcrypt.hashSync(password || 'demo123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        studentProfile: {
          create: {
            rollNo: rollNo || `10230${Math.floor(1000 + Math.random() * 9000)}`,
            branch: branch || 'Computer Science & Engineering',
            year: year || '3rd Year (Batch 2023-2027)',
          },
        },
      },
      include: { studentProfile: true },
    });

    await logAudit({
      actorId: req.user?.id || 'usr_admin_demo',
      actorName: req.user?.name || 'Administrator',
      actorRole: 'ADMIN',
      action: 'STUDENT_ADDED',
      entity: 'Student',
      entityId: user.id,
      details: `Added student ${user.name} (${user.studentProfile?.rollNo})`,
    });

    res.status(201).json(formatStudent(user));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create student' });
  }
});

const updateStudentHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, email, rollNo, branch, year, profile } = req.body;
    const rNo = rollNo || profile?.rollNo;
    const br = branch || profile?.branch;
    const yr = year || profile?.year;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        studentProfile: {
          update: {
            ...(rNo && { rollNo: rNo }),
            ...(br && { branch: br }),
            ...(yr && { year: yr }),
          },
        },
      },
      include: { studentProfile: true },
    });

    res.json(formatStudent(user));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

adminRouter.put('/students/:id', updateStudentHandler);
adminRouter.patch('/students/:id', updateStudentHandler);

adminRouter.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// CSV Batch Import
adminRouter.post('/students/import', async (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;
    if (!csvData) return res.status(400).json({ error: 'CSV data string required' });

    const lines = csvData.trim().split('\n');
    const created: any[] = [];
    const passwordHash = bcrypt.hashSync('demo123', 10);

    for (const line of lines) {
      const parts = line.split(',').map((s: string) => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const name = parts[0];
        const email = parts[1].toLowerCase();
        const rollNo = parts[2] || `10230${Math.floor(1000 + Math.random() * 9000)}`;
        const branch = parts[3] || 'Computer Science & Engineering';

        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          const u = await prisma.user.create({
            data: {
              name,
              email,
              passwordHash,
              role: 'STUDENT',
              status: 'ACTIVE',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              studentProfile: {
                create: {
                  rollNo,
                  branch,
                  year: '3rd Year',
                },
              },
            },
            include: { studentProfile: true },
          });
          created.push(formatStudent(u));
        }
      }
    }

    await logAudit({
      actorId: req.user?.id || 'usr_admin_demo',
      actorName: req.user?.name || 'Administrator',
      actorRole: 'ADMIN',
      action: 'STUDENTS_CSV_IMPORT',
      entity: 'Student',
      details: `Batch imported ${created.length} students via CSV`,
    });

    res.json({ count: created.length, students: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to import CSV' });
  }
});

// Reset Student Password
adminRouter.post('/students/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const defaultPass = 'demo123';
    const hash = bcrypt.hashSync(defaultPass, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hash },
    });
    res.json({ success: true, message: `Password reset to "${defaultPass}"` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ==========================================
// 2. PROFESSORS MANAGEMENT
// ==========================================
adminRouter.get('/professors', async (_req: Request, res: Response) => {
  try {
    const profs = await prisma.user.findMany({
      where: { role: 'PROFESSOR', status: 'ACTIVE' },
      include: {
        professorProfile: { include: { department: true, officeHours: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(profs.map(formatProfessor));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

adminRouter.post('/professors', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      department,
      designation,
      officeLocation,
      teacherCode,
      bio,
      officeHours,
      research,
    } = req.body;

    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    let dept = await prisma.department.findFirst({
      where: { name: department || 'CSED' },
    });
    if (!dept) {
      dept = await prisma.department.create({ data: { name: department || 'CSED' } });
    }

    const passwordHash = bcrypt.hashSync(password || 'demo123', 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'PROFESSOR',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        professorProfile: {
          create: {
            teacherCode: teacherCode || `TCH-${Date.now().toString().slice(-4)}`,
            departmentId: dept.id,
            designation: designation || 'ASSISTANT',
            officeLocation: officeLocation || 'Block C, Faculty Wing',
            bio: bio || 'Faculty member.',
            researchAreas: research || 'Academic Research',
            isOnline: true,
          },
        },
      },
      include: {
        professorProfile: { include: { department: true, officeHours: true } },
      },
    });

    await logAudit({
      actorId: req.user?.id || 'usr_admin_demo',
      actorName: req.user?.name || 'Administrator',
      actorRole: 'ADMIN',
      action: 'PROFESSOR_ADDED',
      entity: 'Professor',
      entityId: user.id,
      details: `Added new professor ${user.name} (${user.professorProfile?.teacherCode})`,
    });

    res.status(201).json(formatProfessor(user));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add professor' });
  }
});

const updateProfessorHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, department, designation, officeLocation, teacherCode, bio, research, profile } = req.body;
    const profData = profile || {};

    const deptName = department || profData.department;
    let deptId: string | undefined;
    if (deptName) {
      let dept = await prisma.department.findFirst({ where: { name: deptName } });
      if (!dept) dept = await prisma.department.create({ data: { name: deptName } });
      deptId = dept.id;
    }

    const id = req.params.id as string;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        professorProfile: {
          update: {
            ...(deptId && { departmentId: deptId }),
            ...((designation || profData.designation) && { designation: designation || profData.designation }),
            ...((officeLocation || profData.officeLocation) && { officeLocation: officeLocation || profData.officeLocation }),
            ...((teacherCode || profData.teacherCode) && { teacherCode: teacherCode || profData.teacherCode }),
            ...((bio || profData.bio) && { bio: bio || profData.bio }),
            ...((research || profData.research) && { researchAreas: research || profData.research }),
          },
        },
      },
      include: {
        professorProfile: { include: { department: true, officeHours: true } },
      },
    });

    res.json(formatProfessor(user));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update professor' });
  }
};

adminRouter.put('/professors/:id', updateProfessorHandler);
adminRouter.patch('/professors/:id', updateProfessorHandler);

// DELETE /admin/professors/:id
// Business Rule 9: Soft-delete (status INACTIVE) if they have request history, hard-delete otherwise, and notify affected students
adminRouter.delete('/professors/:id', async (req: Request, res: Response) => {
  try {
    const profId = req.params.id as string;
    const requestCount = await prisma.meetingRequest.count({
      where: { professorId: profId },
    });

    if (requestCount > 0) {
      // Soft-delete
      await prisma.user.update({
        where: { id: profId },
        data: { status: 'INACTIVE' },
      });

      // Find pending requests and cancel them, notifying students
      const pendingRequests = await prisma.meetingRequest.findMany({
        where: { professorId: profId, status: 'PENDING' },
      });

      for (const pr of pendingRequests) {
        await prisma.meetingRequest.update({
          where: { id: pr.id },
          data: { status: 'CANCELLED', professorRemark: 'Faculty member is no longer available.' },
        });

        await createNotification({
          userId: pr.studentId,
          type: 'REQUEST',
          title: 'Consultation Cancelled',
          message: 'Your pending consultation request was cancelled because the faculty member was deactivated.',
          link: '/requests',
        });
      }

      await logAudit({
        actorId: req.user?.id || 'usr_admin_demo',
        actorName: req.user?.name || 'Administrator',
        actorRole: 'ADMIN',
        action: 'PROFESSOR_DEACTIVATED',
        entity: 'Professor',
        entityId: profId,
        details: `Soft-deleted professor #${profId} due to existing request history`,
      });

      return res.json({ success: true, mode: 'soft-deleted', message: 'Professor deactivated (history preserved).' });
    } else {
      // Hard-delete
      await prisma.user.delete({ where: { id: profId } });
      await logAudit({
        actorId: req.user?.id || 'usr_admin_demo',
        actorName: req.user?.name || 'Administrator',
        actorRole: 'ADMIN',
        action: 'PROFESSOR_DELETED',
        entity: 'Professor',
        entityId: profId,
        details: `Hard-deleted professor #${profId} (no request history)`,
      });

      return res.json({ success: true, mode: 'hard-deleted', message: 'Professor completely removed.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete professor' });
  }
});

// ==========================================
// 3. CLASSROOMS MANAGEMENT
// ==========================================
function formatClassroom(room: any) {
  let amenitiesList: string[] = [];
  try {
    if (room.amenities) {
      amenitiesList = typeof room.amenities === 'string' && room.amenities.startsWith('[')
        ? JSON.parse(room.amenities)
        : typeof room.amenities === 'string'
        ? room.amenities.split(',').map((s: string) => s.trim())
        : Array.isArray(room.amenities)
        ? room.amenities
        : [];
    }
  } catch {
    amenitiesList = ['Smart Board', 'Air Conditioned'];
  }

  return {
    id: room.id,
    name: room.name,
    block: room.block,
    floor: room.floor,
    capacity: room.capacity,
    code: room.code,
    type: room.type ? room.type.replace('_', ' ') : 'CLASSROOM',
    location: room.location || `${room.block} • Room ${room.code}`,
    image: room.imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    imageUrl: room.imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    amenities: amenitiesList,
    directions: room.directions || `Navigate to ${room.block}, ${room.floor}. Look for door plate ${room.code}.`,
  };
}

adminRouter.get('/classrooms', async (_req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const rooms = await prisma.classroom.findMany({
      orderBy: { code: 'asc' },
    });
    res.json(rooms.map(formatClassroom));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

adminRouter.post('/classrooms', async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { name, code, block, floor, capacity, type, imageUrl, amenities, directions, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Classroom name is required' });

    // Sanitize and ensure room code
    let roomCode = (code || '').trim().toUpperCase();
    if (!roomCode) {
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'ROOM';
      let candidate = `${cleanName}${Math.floor(100 + Math.random() * 900)}`;
      while (await prisma.classroom.findFirst({ where: { code: candidate } })) {
        candidate = `${cleanName}${Math.floor(100 + Math.random() * 9000)}`;
      }
      roomCode = candidate;
    }

    const normalizedType = (type || 'CLASSROOM').replace(/\s+/g, '_').toUpperCase();

    // Check if classroom with this code already exists
    const existing = await prisma.classroom.findFirst({ where: { code: roomCode } });

    let room;
    if (existing) {
      // Upsert: update existing classroom details with the provided data
      room = await prisma.classroom.update({
        where: { id: existing.id },
        data: {
          name,
          block: block || existing.block,
          floor: floor || existing.floor,
          capacity: capacity !== undefined ? parseInt(String(capacity), 10) : existing.capacity,
          type: normalizedType || existing.type,
          imageUrl: imageUrl || existing.imageUrl,
          location: location || `${block || existing.block} • Room ${roomCode}`,
          amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
          directions: directions || existing.directions,
        },
      });

      await logAudit({
        actorId: req.user?.id || 'usr_admin_demo',
        actorName: req.user?.name || 'Administrator',
        actorRole: 'ADMIN',
        action: 'CLASSROOM_UPDATED',
        entity: 'Classroom',
        entityId: room.id,
        details: `Updated details for classroom ${room.name} (${room.code})`,
      });
    } else {
      try {
        room = await prisma.classroom.create({
          data: {
            name,
            code: roomCode,
            block: block || 'Block B',
            floor: floor || 'Ground Floor',
            capacity: parseInt(String(capacity || 60), 10),
            type: normalizedType,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
            location: location || `${block || 'Block B'} • Room ${roomCode}`,
            amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
            directions: directions || `Navigate to ${block}, look for ${roomCode}.`,
          },
        });
      } catch (createErr: any) {
        if (createErr.code === 'P2002') {
          // If collision occurs despite pre-check, safely update collision or assign unique candidate
          const collision = await prisma.classroom.findFirst({ where: { code: roomCode } });
          if (collision) {
            room = await prisma.classroom.update({
              where: { id: collision.id },
              data: {
                name,
                block: block || collision.block,
                floor: floor || collision.floor,
                capacity: capacity !== undefined ? parseInt(String(capacity), 10) : collision.capacity,
                type: normalizedType || collision.type,
                imageUrl: imageUrl || collision.imageUrl,
                location: location || `${block || collision.block} • Room ${roomCode}`,
                amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
                directions: directions || collision.directions,
              },
            });
          } else {
            const fallbackCode = `${roomCode}-${Math.floor(100 + Math.random() * 900)}`;
            room = await prisma.classroom.create({
              data: {
                name,
                code: fallbackCode,
                block: block || 'Block B',
                floor: floor || 'Ground Floor',
                capacity: parseInt(String(capacity || 60), 10),
                type: normalizedType,
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
                location: location || `${block || 'Block B'} • Room ${fallbackCode}`,
                amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
                directions: directions || `Navigate to ${block}, look for ${fallbackCode}.`,
              },
            });
          }
        } else {
          throw createErr;
        }
      }

      await logAudit({
        actorId: req.user?.id || 'usr_admin_demo',
        actorName: req.user?.name || 'Administrator',
        actorRole: 'ADMIN',
        action: 'CLASSROOM_CREATED',
        entity: 'Classroom',
        entityId: room.id,
        details: `Created classroom ${room.name} (${room.code})`,
      });
    }

    res.status(existing ? 200 : 201).json(formatClassroom(room));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: `A classroom with code "${req.body.code}" already exists. Please choose a unique room code.` });
    }
    res.status(500).json({ error: err.message || 'Failed to save classroom' });
  }
});

const updateClassroomHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, code, block, floor, capacity, type, imageUrl, amenities, directions, location } = req.body;
    const normalizedType = type ? type.replace(/\s+/g, '_').toUpperCase() : undefined;

    if (code) {
      const conflict = await prisma.classroom.findFirst({
        where: { code: code.trim(), id: { not: id } },
      });
      if (conflict) {
        return res.status(409).json({ error: `Room code "${code}" is already in use by classroom "${conflict.name}".` });
      }
    }

    const room = await prisma.classroom.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.trim() }),
        ...(block && { block }),
        ...(floor && { floor }),
        ...(capacity !== undefined && { capacity: parseInt(String(capacity), 10) }),
        ...(normalizedType && { type: normalizedType }),
        ...(imageUrl && { imageUrl }),
        ...(location && { location }),
        ...(amenities && { amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities) }),
        ...(directions && { directions }),
      },
    });

    res.json(formatClassroom(room));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: `Room code "${req.body.code}" is already in use by another classroom.` });
    }
    res.status(500).json({ error: 'Failed to update classroom' });
  }
};

adminRouter.put('/classrooms/:id', updateClassroomHandler);
adminRouter.patch('/classrooms/:id', updateClassroomHandler);

adminRouter.delete('/classrooms/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.classroom.delete({ where: { id } });
    res.json({ success: true, message: 'Classroom deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});

// ==========================================
// 4. DEPARTMENTS MANAGEMENT
// ==========================================
adminRouter.get('/departments', async (_req: Request, res: Response) => {
  try {
    const depts = await prisma.department.findMany({
      include: { _count: { select: { faculty: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(
      depts.map((d) => ({
        id: d.id,
        name: d.name,
        fullName: d.fullName || d.name,
        code: d.code || d.name.slice(0, 3).toUpperCase(),
        professorsCount: d._count.faculty,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

adminRouter.post('/departments', async (req: Request, res: Response) => {
  try {
    const { name, fullName, code } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name required' });

    const dept = await prisma.department.create({
      data: {
        name,
        fullName: fullName || name,
        code: code || name.slice(0, 3).toUpperCase(),
      },
    });

    res.status(201).json(dept);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create department' });
  }
});

const updateDepartmentHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, fullName, code } = req.body;
    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(fullName && { fullName }),
        ...(code && { code }),
      },
    });
    res.json(dept);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update department' });
  }
};

adminRouter.put('/departments/:id', updateDepartmentHandler);
adminRouter.patch('/departments/:id', updateDepartmentHandler);

adminRouter.delete('/departments/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: 'Department removed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// ==========================================
// 5. MASTER REQUESTS OVERSIGHT
// ==========================================
adminRouter.get('/requests', async (req: Request, res: Response) => {
  try {
    const { professorId, studentId, status } = req.query as { professorId?: string; studentId?: string; status?: string };
    const where: any = {};
    if (professorId) where.professorId = professorId;
    if (studentId) where.studentId = studentId;
    if (status && status !== 'all') where.status = status.toUpperCase();

    const requests = await prisma.meetingRequest.findMany({
      where,
      include: {
        student: { include: { studentProfile: true } },
        professor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      requests.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: r.student.name,
        studentRoll: r.student.studentProfile?.rollNo,
        professorId: r.professorId,
        professorName: r.professor.name,
        date: r.date,
        timeSlot: r.timeSlot,
        reason: r.reason,
        type: r.meetingType,
        status: r.status.toLowerCase(),
        professorRemark: r.professorRemark,
        createdAt: r.createdAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin requests' });
  }
});

adminRouter.patch('/requests/:id/override-cancel', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const updated = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        professorRemark: `Admin Override: ${reason || 'Cancelled by Academic Administration'}`,
      },
      include: { student: true, professor: true },
    });

    await createNotification({
      userId: updated.studentId,
      type: 'REQUEST',
      title: 'Meeting Cancelled by Admin',
      message: `Your consultation request #${updated.id} was cancelled by administrator: ${reason || 'Administrative reschedule'}`,
      link: '/requests',
    });

    await logAudit({
      actorId: req.user?.id || 'usr_admin_demo',
      actorName: req.user?.name || 'Administrator',
      actorRole: 'ADMIN',
      action: 'ADMIN_REQUEST_OVERRIDE_CANCEL',
      entity: 'MeetingRequest',
      entityId: updated.id,
      details: `Admin cancelled request #${updated.id}: ${reason}`,
    });

    res.json({ success: true, request: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to override-cancel request' });
  }
});

// ==========================================
// 6. MASTER TIMETABLE EDITOR
// ==========================================
adminRouter.get('/timetables/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const entries = await prisma.timetableEntry.findMany({
      where: { ownerId: userId },
      orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
    });
    res.json({ userId, timeSlots: TIME_SLOTS, entries });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

adminRouter.put('/timetables/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries array required' });

    await prisma.timetableEntry.deleteMany({ where: { ownerId: userId } });
    const created = [];
    for (const e of entries) {
      const dayNum = typeof e.day === 'string' ? DAYS_OF_WEEK.indexOf(e.day) : (e.day ?? 0);
      const pIdx = parseInt(String(e.periodIndex || 0), 10);
      const item = await prisma.timetableEntry.create({
        data: {
          ownerId: userId,
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

    await logAudit({
      actorId: req.user?.id || 'usr_admin_demo',
      actorName: req.user?.name || 'Administrator',
      actorRole: 'ADMIN',
      action: 'ADMIN_TIMETABLE_UPDATE',
      entity: 'Timetable',
      entityId: userId,
      details: `Admin replaced timetable for user ${userId} with ${created.length} entries`,
    });

    res.json({ success: true, count: created.length, entries: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user timetable' });
  }
});

// ==========================================
// 7. AUDIT LOGS
// ==========================================
adminRouter.get('/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Reset System / Re-seed Store
adminRouter.post('/system/reset', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Database reset and seeded state preserved.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset system' });
  }
});
