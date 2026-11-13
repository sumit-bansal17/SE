import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer setup for file uploads (max 10MB per attachment file)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file
});

// ==========================================
// 1. AUTH ROUTES
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  db.createAuditLog({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: 'USER_LOGIN',
    entity: 'Auth',
    details: `User signed in successfully: ${user.email} (${user.role})`
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      profile: user.profile
    },
    token: `token_${user.id}_${Date.now()}`
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, profile } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const userRole = role === 'professor' ? 'professor' : 'student';
  const newUser = db.createUser({
    email,
    password,
    name,
    role: userRole,
    profile: profile || {}
  });

  db.createAuditLog({
    actorId: newUser.id,
    actorName: newUser.name,
    actorRole: newUser.role,
    action: 'USER_REGISTER',
    entity: 'Auth',
    details: `New account registered as ${userRole}: ${newUser.name} (${newUser.email})`
  });

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      profile: newUser.profile
    },
    token: `token_${newUser.id}_${Date.now()}`
  });
});

// ==========================================
// 2. CLASSROOMS
// ==========================================
app.get('/api/classrooms', (req, res) => {
  const classrooms = db.getClassrooms();
  res.json(classrooms);
});

app.get('/api/classrooms/:id', (req, res) => {
  const room = db.getClassroom(req.params.id);
  if (!room) return res.status(404).json({ error: 'Classroom not found' });
  res.json(room);
});

app.post('/api/classrooms', (req, res) => {
  const room = db.createClassroom(req.body);
  db.createAuditLog({
    actorId: req.body.adminId || 'usr_admin_demo',
    actorName: 'Administrator',
    actorRole: 'admin',
    action: 'CLASSROOM_CREATED',
    entity: 'Classroom',
    details: `Created classroom ${room.name} (${room.code}) in ${room.block}`
  });
  res.status(201).json(room);
});

app.put('/api/classrooms/:id', (req, res) => {
  const updated = db.updateClassroom(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Classroom not found' });
  res.json(updated);
});

app.delete('/api/classrooms/:id', (req, res) => {
  const ok = db.deleteClassroom(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Classroom not found' });
  res.json({ success: true });
});

// ==========================================
// 3. PROFESSORS DIRECTORY
// ==========================================
app.get('/api/professors', (req, res) => {
  const users = db.getUsers().filter((u) => u.role === 'professor');
  res.json(users);
});

app.get('/api/professors/:id', (req, res) => {
  const prof = db.getUser(req.params.id);
  if (!prof || prof.role !== 'professor') {
    return res.status(404).json({ error: 'Professor not found' });
  }
  const timetable = db.getTimetable(prof.id);
  res.json({ ...prof, timetable });
});

app.post('/api/professors', (req, res) => {
  const { name, email, password, department, designation, officeLocation, teacherCode, bio, officeHours, research } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const newUser = db.createUser({
    name,
    email,
    password: password || 'demo123',
    role: 'professor',
    profile: {
      department: department || 'CSED',
      designation: designation || 'ASSISTANT',
      officeLocation: officeLocation || 'Block C, Faculty Wing',
      teacherCode: teacherCode || `TCH-${Date.now().toString().slice(-4)}`,
      bio: bio || 'Faculty member.',
      officeHours: officeHours || 'Mon-Fri: 03:00 PM - 05:00 PM',
      research: research || 'Academic Research',
      isOnline: true
    }
  });

  db.createAuditLog({
    actorId: 'usr_admin_demo',
    actorName: 'Admin',
    actorRole: 'admin',
    action: 'PROFESSOR_ADDED',
    entity: 'Professor',
    details: `Added new professor ${newUser.name} (${newUser.profile?.teacherCode}) in ${newUser.profile?.department}`
  });

  res.status(201).json(newUser);
});

app.put('/api/professors/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Professor not found' });
  res.json(updated);
});

app.delete('/api/professors/:id', (req, res) => {
  const ok = db.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Professor not found' });
  res.json({ success: true });
});

// ==========================================
// 4. STUDENTS DIRECTORY
// ==========================================
app.get('/api/students', (req, res) => {
  const students = db.getUsers().filter((u) => u.role === 'student');
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { name, email, password, rollNo, branch, year } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const newUser = db.createUser({
    name,
    email,
    password: password || 'demo123',
    role: 'student',
    profile: {
      rollNo: rollNo || `10230${Math.floor(1000 + Math.random() * 9000)}`,
      branch: branch || 'Computer Science & Engineering',
      year: year || '3rd Year (Batch 2023-2027)'
    }
  });

  db.createAuditLog({
    actorId: 'usr_admin_demo',
    actorName: 'Admin',
    actorRole: 'admin',
    action: 'STUDENT_ADDED',
    entity: 'Student',
    details: `Added student ${newUser.name} (Roll: ${newUser.profile?.rollNo})`
  });

  res.status(201).json(newUser);
});

app.put('/api/students/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Student not found' });
  res.json(updated);
});

app.delete('/api/students/:id', (req, res) => {
  const ok = db.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Student not found' });
  res.json({ success: true });
});

// CSV Batch Import for Students
app.post('/api/students/import-csv', (req, res) => {
  const { csvData } = req.body;
  if (!csvData) return res.status(400).json({ error: 'CSV data string required' });

  const lines = csvData.trim().split('\n');
  const created = [];
  lines.forEach((line) => {
    const parts = line.split(',').map((s) => s.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const name = parts[0];
      const email = parts[1];
      const rollNo = parts[2] || `10230${Math.floor(1000 + Math.random() * 9000)}`;
      const branch = parts[3] || 'Computer Science & Engineering';
      if (!db.findUserByEmail(email)) {
        const u = db.createUser({
          name,
          email,
          password: 'demo123',
          role: 'student',
          profile: { rollNo, branch, year: '3rd Year' }
        });
        created.push(u);
      }
    }
  });

  db.createAuditLog({
    actorId: 'usr_admin_demo',
    actorName: 'Admin',
    actorRole: 'admin',
    action: 'STUDENTS_CSV_IMPORT',
    entity: 'Student',
    details: `Batch imported ${created.length} students via CSV`
  });

  res.json({ count: created.length, students: created });
});

// ==========================================
// 5. TIMETABLES
// ==========================================
app.get('/api/timetables/:ownerId', (req, res) => {
  const timetable = db.getTimetable(req.params.ownerId);
  const timeSlots = db.getTimeSlots();
  res.json({ ownerId: req.params.ownerId, timeSlots, entries: timetable });
});

app.post('/api/timetables/entry', (req, res) => {
  const { ownerId, day, periodIndex, timeSlot, subject, roomId, roomName, professorName, color } = req.body;
  if (!ownerId || !day || periodIndex === undefined) {
    return res.status(400).json({ error: 'Missing required timetable slot parameters' });
  }
  const entry = db.saveTimetableEntry({
    ownerId,
    day,
    periodIndex: parseInt(periodIndex),
    timeSlot: timeSlot || db.getTimeSlots()[periodIndex],
    subject: subject || 'Free Period',
    roomId: roomId || null,
    roomName: roomName || '',
    professorName: professorName || '',
    color: color || '#640000'
  });
  res.json(entry);
});

app.delete('/api/timetables/entry/:id', (req, res) => {
  const ok = db.deleteTimetableEntry(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Timetable entry not found' });
  res.json({ success: true });
});

app.post('/api/timetables/bulk', (req, res) => {
  const { ownerId, entries } = req.body;
  if (!ownerId || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'ownerId and entries array required' });
  }
  const updated = db.replaceTimetable(ownerId, entries);
  res.json(updated);
});

// ==========================================
// 6. MEETING REQUESTS & CONFLICT CHECKING
// ==========================================
app.get('/api/requests', (req, res) => {
  const { userId, role, status } = req.query;
  let requests = db.getMeetingRequests();

  if (userId) {
    if (role === 'professor') {
      requests = requests.filter((r) => r.professorId === userId);
    } else if (role === 'student') {
      requests = requests.filter((r) => r.studentId === userId);
    } else {
      requests = requests.filter((r) => r.studentId === userId || r.professorId === userId);
    }
  }

  if (status && status !== 'all') {
    requests = requests.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }

  res.json(requests);
});

// Conflict checking endpoint
app.get('/api/requests/check-conflict', (req, res) => {
  const { professorId, studentId, date, timeSlot } = req.query;
  const conflict = db.checkSlotConflict({ professorId, studentId, date, timeSlot });
  res.json(conflict);
});

// Create meeting request with optional file upload (multer)
app.post('/api/requests', upload.single('attachment'), (req, res) => {
  try {
    const { studentId, studentName, studentRoll, studentBranch, professorId, professorName, date, timeSlot, reason, type } = req.body;

    if (!studentId || !professorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ error: 'Missing mandatory fields: studentId, professorId, date, timeSlot, reason are required.' });
    }

    // Check conflict
    const conflict = db.checkSlotConflict({ professorId, studentId, date, timeSlot });
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

    const meetingReq = db.createMeetingRequest({
      studentId,
      studentName,
      studentRoll,
      studentBranch,
      professorId,
      professorName,
      date,
      timeSlot,
      reason,
      type: type || 'General Consultation',
      attachmentUrl,
      attachmentName,
      attachmentSize
    });

    // Notify professor
    db.createNotification({
      userId: professorId,
      title: 'New Meeting Request',
      message: `${studentName} requested a meeting on ${date} (${timeSlot}) regarding "${reason.slice(0, 45)}...".`,
      link: '/requests'
    });

    // Audit log
    db.createAuditLog({
      actorId: studentId,
      actorName: studentName,
      actorRole: 'student',
      action: 'REQUEST_SUBMITTED',
      entity: 'MeetingRequest',
      details: `Meeting requested with ${professorName} for ${date} at ${timeSlot}`
    });

    res.status(201).json(meetingReq);
  } catch (err) {
    console.error('Error submitting meeting request:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Update meeting request (Accept, Reject with remark, Propose new time, Cancel)
app.patch('/api/requests/:id', (req, res) => {
  const { status, professorRemark, rescheduledSlot, rescheduledDate } = req.body;
  const existing = db.getMeetingRequest(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Meeting request not found' });

  // If accepting, enforce double-booking prevention check!
  if (status === 'accepted') {
    const conflict = db.checkSlotConflict({
      professorId: existing.professorId,
      studentId: existing.studentId,
      date: existing.date,
      timeSlot: existing.timeSlot
    });
    // Note: ignore conflict with this very request itself
    if (conflict.hasConflict && conflict.type === 'PROFESSOR_MEETING_BUSY') {
      return res.status(409).json({ error: conflict.reason });
    }
  }

  const updates = {};
  if (status) updates.status = status;
  if (professorRemark !== undefined) updates.professorRemark = professorRemark;
  if (rescheduledSlot) updates.rescheduledSlot = rescheduledSlot;
  if (rescheduledDate) updates.date = rescheduledDate;

  const updated = db.updateMeetingRequest(req.params.id, updates);

  // Send relevant notification
  if (status === 'accepted') {
    db.createNotification({
      userId: existing.studentId,
      title: 'Meeting Accepted',
      message: `${existing.professorName} accepted your consultation request for ${existing.date} (${existing.timeSlot}).`,
      link: '/requests'
    });
    db.createAuditLog({
      actorId: existing.professorId,
      actorName: existing.professorName,
      actorRole: 'professor',
      action: 'REQUEST_ACCEPTED',
      entity: 'MeetingRequest',
      details: `Accepted request #${existing.id} from ${existing.studentName} for ${existing.date} at ${existing.timeSlot}`
    });
  } else if (status === 'rejected') {
    db.createNotification({
      userId: existing.studentId,
      title: 'Meeting Declined',
      message: `${existing.professorName} declined your meeting request. Reason: ${professorRemark || 'Not available'}`,
      link: '/requests'
    });
    db.createAuditLog({
      actorId: existing.professorId,
      actorName: existing.professorName,
      actorRole: 'professor',
      action: 'REQUEST_REJECTED',
      entity: 'MeetingRequest',
      details: `Declined request #${existing.id} with remark: ${professorRemark}`
    });
  } else if (status === 'cancelled') {
    db.createAuditLog({
      actorId: existing.studentId,
      actorName: existing.studentName,
      actorRole: 'student',
      action: 'REQUEST_CANCELLED',
      entity: 'MeetingRequest',
      details: `Cancelled consultation request #${existing.id}`
    });
  }

  res.json(updated);
});

// ==========================================
// 7. WORKSPACE (TASKS, NOTES, LINKS, FILES + 20MB QUOTA)
// ==========================================
app.get('/api/workspace/:ownerId', (req, res) => {
  const { ownerId } = req.params;
  const tasks = db.getTasks(ownerId);
  const notes = db.getNotes(ownerId);
  const links = db.getLinks(ownerId);
  const files = db.getFiles(ownerId);
  const quota = db.getUserStorageUsage(ownerId);

  res.json({ tasks, notes, links, files, quota });
});

// Tasks
app.post('/api/workspace/:ownerId/tasks', (req, res) => {
  const task = db.createTask({
    ownerId: req.params.ownerId,
    label: req.body.label,
    sub: req.body.sub || 'Academic Coursework',
    category: req.body.category || 'General'
  });
  res.status(201).json(task);
});

app.patch('/api/workspace/tasks/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

app.delete('/api/workspace/tasks/:id', (req, res) => {
  const ok = db.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

// Notes
app.post('/api/workspace/:ownerId/notes', (req, res) => {
  const note = db.createNote({
    ownerId: req.params.ownerId,
    title: req.body.title || 'Untitled Academic Note',
    content: req.body.content || ''
  });
  res.status(201).json(note);
});

app.patch('/api/workspace/notes/:id', (req, res) => {
  const updated = db.updateNote(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json(updated);
});

app.delete('/api/workspace/notes/:id', (req, res) => {
  const ok = db.deleteNote(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

// Links
app.post('/api/workspace/:ownerId/links', (req, res) => {
  const link = db.createLink({
    ownerId: req.params.ownerId,
    title: req.body.title || 'Resource Link',
    url: req.body.url || 'https://thapar.edu'
  });
  res.status(201).json(link);
});

app.delete('/api/workspace/links/:id', (req, res) => {
  const ok = db.deleteLink(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Link not found' });
  res.json({ success: true });
});

// Files & 20MB Quota Enforcement
app.post('/api/workspace/:ownerId/files', upload.single('file'), (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSizeMB = Math.round((req.file.size / (1024 * 1024)) * 100) / 100;
    const file = db.createFile({
      ownerId,
      name: req.file.originalname,
      size: fileSizeMB,
      url: `/uploads/${req.file.filename}`
    });

    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/workspace/files/:id', (req, res) => {
  const ok = db.deleteFile(req.params.id);
  if (!ok) return res.status(404).json({ error: 'File not found' });
  res.json({ success: true });
});

// ==========================================
// 8. NOTIFICATIONS
// ==========================================
app.get('/api/notifications/:userId', (req, res) => {
  const notifs = db.getNotifications(req.params.userId);
  res.json(notifs);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const ok = db.markNotificationRead(req.params.id);
  res.json({ success: ok });
});

app.post('/api/notifications/:userId/read-all', (req, res) => {
  db.markAllNotificationsRead(req.params.userId);
  res.json({ success: true });
});

// ==========================================
// 9. DEPARTMENTS
// ==========================================
app.get('/api/departments', (req, res) => {
  res.json(db.getDepartments());
});

app.post('/api/departments', (req, res) => {
  const dept = db.createDepartment(req.body);
  res.status(201).json(dept);
});

app.delete('/api/departments/:id', (req, res) => {
  const ok = db.deleteDepartment(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 10. AUDIT LOGS
// ==========================================
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

// System Reset
app.post('/api/system/reset', (req, res) => {
  db.resetStore();
  res.json({ success: true, message: 'Database reset to initial sample state.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[SnapLocate API] Academic Server running on http://localhost:${PORT}`);
});
