import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultSeed } from './data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'store.json');

// Ensure directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize store if not present
function initStore() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultSeed, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(defaultSeed));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store.json, re-seeding:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultSeed, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(defaultSeed));
  }
}

let store = initStore();

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

export const db = {
  // Re-seed utility
  resetStore() {
    store = JSON.parse(JSON.stringify(defaultSeed));
    saveStore();
    return store;
  },

  // USERS
  getUsers() {
    return store.users || [];
  },
  getUser(id) {
    return (store.users || []).find((u) => u.id === id);
  },
  findUserByEmail(email) {
    if (!email) return null;
    return (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  createUser(userData) {
    const user = {
      id: userData.id || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      email: userData.email,
      password: userData.password || 'demo123',
      name: userData.name,
      role: userData.role || 'student',
      avatar: userData.avatar || (userData.role === 'professor' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      status: 'active',
      profile: userData.profile || {},
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
    saveStore();
    return user;
  },
  updateUser(id, updates) {
    const idx = (store.users || []).findIndex((u) => u.id === id);
    if (idx === -1) return null;
    store.users[idx] = {
      ...store.users[idx],
      ...updates,
      profile: { ...(store.users[idx].profile || {}), ...(updates.profile || {}) }
    };
    saveStore();
    return store.users[idx];
  },
  deleteUser(id) {
    const idx = (store.users || []).findIndex((u) => u.id === id);
    if (idx === -1) return false;
    store.users.splice(idx, 1);
    // Also clean up owner items
    store.timetables = (store.timetables || []).filter((t) => t.ownerId !== id);
    store.tasks = (store.tasks || []).filter((t) => t.ownerId !== id);
    store.notes = (store.notes || []).filter((n) => n.ownerId !== id);
    store.links = (store.links || []).filter((l) => l.ownerId !== id);
    store.files = (store.files || []).filter((f) => f.ownerId !== id);
    saveStore();
    return true;
  },

  // CLASSROOMS
  getClassrooms() {
    return store.classrooms || [];
  },
  getClassroom(id) {
    return (store.classrooms || []).find((c) => c.id === id);
  },
  createClassroom(data) {
    const room = {
      id: data.id || `cls-${Date.now()}`,
      name: data.name,
      block: data.block || 'Block B',
      floor: data.floor || 'Ground Floor',
      capacity: parseInt(data.capacity) || 60,
      code: data.code || 'RM-NEW',
      type: data.type || 'LECTURE HALL',
      location: data.location || `${data.block} • Room ${data.code}`,
      image: data.image || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      amenities: data.amenities || ['Projector', 'Air Conditioned', 'Whiteboard'],
      directions: data.directions || 'Central Corridor entrance.',
      createdAt: new Date().toISOString()
    };
    store.classrooms.push(room);
    saveStore();
    return room;
  },
  updateClassroom(id, updates) {
    const idx = (store.classrooms || []).findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.classrooms[idx] = { ...store.classrooms[idx], ...updates };
    saveStore();
    return store.classrooms[idx];
  },
  deleteClassroom(id) {
    const idx = (store.classrooms || []).findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.classrooms.splice(idx, 1);
    saveStore();
    return true;
  },

  // TIMETABLES
  getTimeSlots() {
    return store.timeSlots || [
      '8:00-8:50', '8:50-9:40', '9:40-10:30', '10:30-11:20', '11:20-12:10',
      '12:10-1:00', '1:00-1:50', '1:50-2:40', '2:40-3:30', '3:30-4:20',
      '4:20-5:10', '5:10-6:00', '6:00-6:50'
    ];
  },
  getTimetable(ownerId) {
    return (store.timetables || []).filter((t) => t.ownerId === ownerId);
  },
  saveTimetableEntry(entry) {
    const existingIdx = (store.timetables || []).findIndex(
      (t) => t.ownerId === entry.ownerId && t.day === entry.day && t.periodIndex === entry.periodIndex
    );
    if (existingIdx >= 0) {
      store.timetables[existingIdx] = {
        ...store.timetables[existingIdx],
        ...entry
      };
      saveStore();
      return store.timetables[existingIdx];
    } else {
      const newEntry = {
        id: entry.id || `tt-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        ...entry
      };
      store.timetables.push(newEntry);
      saveStore();
      return newEntry;
    }
  },
  deleteTimetableEntry(id) {
    const idx = (store.timetables || []).findIndex((t) => t.id === id);
    if (idx === -1) return false;
    store.timetables.splice(idx, 1);
    saveStore();
    return true;
  },
  replaceTimetable(ownerId, entries) {
    store.timetables = (store.timetables || []).filter((t) => t.ownerId !== ownerId);
    entries.forEach((e) => {
      store.timetables.push({
        id: e.id || `tt-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        ownerId,
        ...e
      });
    });
    saveStore();
    return this.getTimetable(ownerId);
  },

  // MEETING REQUESTS & CONFLICT CHECKING
  getMeetingRequests() {
    return store.meetingRequests || [];
  },
  getMeetingRequest(id) {
    return (store.meetingRequests || []).find((r) => r.id === id);
  },
  createMeetingRequest(data) {
    const req = {
      id: data.id || `req-${Date.now()}`,
      studentId: data.studentId,
      studentName: data.studentName || 'Student',
      studentRoll: data.studentRoll || 'N/A',
      studentBranch: data.studentBranch || 'Computer Science',
      professorId: data.professorId,
      professorName: data.professorName || 'Professor',
      date: data.date, // YYYY-MM-DD
      timeSlot: data.timeSlot, // e.g. '3:30-4:20'
      reason: data.reason,
      type: data.type || 'General Guidance',
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
      attachmentSize: data.attachmentSize || 0,
      status: 'pending', // pending, accepted, rejected, cancelled, rescheduled
      professorRemark: null,
      rescheduledSlot: null,
      createdAt: new Date().toISOString()
    };
    store.meetingRequests.unshift(req);
    saveStore();
    return req;
  },
  updateMeetingRequest(id, updates) {
    const idx = (store.meetingRequests || []).findIndex((r) => r.id === id);
    if (idx === -1) return null;
    store.meetingRequests[idx] = {
      ...store.meetingRequests[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveStore();
    return store.meetingRequests[idx];
  },
  deleteMeetingRequest(id) {
    const idx = (store.meetingRequests || []).findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.meetingRequests.splice(idx, 1);
    saveStore();
    return true;
  },

  // Helper to determine day of week name from YYYY-MM-DD
  getDayOfWeek(dateStr) {
    if (!dateStr) return 'Monday';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return isNaN(d.getDay()) ? 'Monday' : days[d.getDay()];
  },

  // SLOT CONFLICT DETECTION ENGINE
  checkSlotConflict({ professorId, studentId, date, timeSlot }) {
    if (!date || !timeSlot) {
      return { hasConflict: false, reason: null };
    }

    const day = this.getDayOfWeek(date);

    // 1. Check if Professor has an already ACCEPTED meeting at this exact date and slot
    const profAcceptedMeeting = (store.meetingRequests || []).find(
      (r) => r.professorId === professorId && r.date === date && r.timeSlot === timeSlot && r.status === 'accepted'
    );
    if (profAcceptedMeeting) {
      return {
        hasConflict: true,
        type: 'PROFESSOR_MEETING_BUSY',
        reason: `Professor already has an accepted consultation booked on ${date} at ${timeSlot}.`
      };
    }

    // 2. Check Professor's weekly timetable for teaching duties / classes
    const profClass = (store.timetables || []).find(
      (t) => t.ownerId === professorId && t.day.toLowerCase() === day.toLowerCase() && t.timeSlot === timeSlot
    );
    if (profClass) {
      return {
        hasConflict: true,
        type: 'PROFESSOR_CLASS_CONFLICT',
        reason: `Professor is engaged in teaching "${profClass.subject}" in ${profClass.roomName || 'Classroom'} on ${day}s at ${timeSlot}.`
      };
    }

    // 3. Check Student's conflicts if studentId provided
    if (studentId) {
      // 3a. Student already has an accepted meeting at this date and slot
      const studentAcceptedMeeting = (store.meetingRequests || []).find(
        (r) => r.studentId === studentId && r.date === date && r.timeSlot === timeSlot && r.status === 'accepted'
      );
      if (studentAcceptedMeeting) {
        return {
          hasConflict: true,
          type: 'STUDENT_MEETING_BUSY',
          reason: `You already have an accepted meeting scheduled on ${date} at ${timeSlot}.`
        };
      }

      // 3b. Student has a class in their own timetable at this slot
      const studentClass = (store.timetables || []).find(
        (t) => t.ownerId === studentId && t.day.toLowerCase() === day.toLowerCase() && t.timeSlot === timeSlot
      );
      if (studentClass) {
        return {
          hasConflict: true,
          type: 'STUDENT_CLASS_CONFLICT',
          reason: `Schedule conflict: You have your scheduled class "${studentClass.subject}" on ${day} at ${timeSlot}.`
        };
      }
    }

    return { hasConflict: false, reason: null };
  },

  // WORKSPACE: TASKS
  getTasks(ownerId) {
    return (store.tasks || []).filter((t) => !ownerId || t.ownerId === ownerId);
  },
  createTask(data) {
    const task = {
      id: data.id || `tsk-${Date.now()}`,
      ownerId: data.ownerId,
      label: data.label,
      sub: data.sub || 'Academic Task',
      category: data.category || 'General',
      is_done: false,
      createdAt: new Date().toISOString()
    };
    store.tasks.unshift(task);
    saveStore();
    return task;
  },
  updateTask(id, updates) {
    const idx = (store.tasks || []).findIndex((t) => t.id === id);
    if (idx === -1) return null;
    store.tasks[idx] = { ...store.tasks[idx], ...updates };
    saveStore();
    return store.tasks[idx];
  },
  deleteTask(id) {
    const idx = (store.tasks || []).findIndex((t) => t.id === id);
    if (idx === -1) return false;
    store.tasks.splice(idx, 1);
    saveStore();
    return true;
  },

  // WORKSPACE: NOTES
  getNotes(ownerId) {
    return (store.notes || []).filter((n) => !ownerId || n.ownerId === ownerId);
  },
  createNote(data) {
    const note = {
      id: data.id || `note-${Date.now()}`,
      ownerId: data.ownerId,
      title: data.title || 'Untitled Note',
      content: data.content || '',
      updatedAt: new Date().toISOString()
    };
    store.notes.unshift(note);
    saveStore();
    return note;
  },
  updateNote(id, updates) {
    const idx = (store.notes || []).findIndex((n) => n.id === id);
    if (idx === -1) return null;
    store.notes[idx] = { ...store.notes[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore();
    return store.notes[idx];
  },
  deleteNote(id) {
    const idx = (store.notes || []).findIndex((n) => n.id === id);
    if (idx === -1) return false;
    store.notes.splice(idx, 1);
    saveStore();
    return true;
  },

  // WORKSPACE: LINKS
  getLinks(ownerId) {
    return (store.links || []).filter((l) => !ownerId || l.ownerId === ownerId);
  },
  createLink(data) {
    const link = {
      id: data.id || `link-${Date.now()}`,
      ownerId: data.ownerId,
      title: data.title,
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      createdAt: new Date().toISOString()
    };
    store.links.push(link);
    saveStore();
    return link;
  },
  deleteLink(id) {
    const idx = (store.links || []).findIndex((l) => l.id === id);
    if (idx === -1) return false;
    store.links.splice(idx, 1);
    saveStore();
    return true;
  },

  // WORKSPACE: FILES & STORAGE QUOTA (20 MB PER USER)
  getFiles(ownerId) {
    return (store.files || []).filter((f) => !ownerId || f.ownerId === ownerId);
  },
  getUserStorageUsage(ownerId) {
    const userFiles = this.getFiles(ownerId);
    const totalMB = userFiles.reduce((acc, f) => acc + (parseFloat(f.size) || 0), 0);
    return {
      usedMB: Math.round(totalMB * 100) / 100,
      maxMB: 20.0,
      percentage: Math.min(100, Math.round((totalMB / 20.0) * 100))
    };
  },
  createFile(data) {
    const usage = this.getUserStorageUsage(data.ownerId);
    const addedSize = parseFloat(data.size) || 0;
    if (usage.usedMB + addedSize > 20.0) {
      throw new Error(`Storage quota exceeded. You have ${usage.usedMB} MB used of 20 MB max.`);
    }

    const file = {
      id: data.id || `file-${Date.now()}`,
      ownerId: data.ownerId,
      name: data.name,
      size: addedSize,
      url: data.url || '#',
      uploadedAt: new Date().toISOString()
    };
    store.files.push(file);
    saveStore();
    return file;
  },
  deleteFile(id) {
    const idx = (store.files || []).findIndex((f) => f.id === id);
    if (idx === -1) return false;
    store.files.splice(idx, 1);
    saveStore();
    return true;
  },

  // NOTIFICATIONS
  getNotifications(userId) {
    return (store.notifications || []).filter((n) => !userId || n.userId === userId);
  },
  createNotification(data) {
    const notif = {
      id: data.id || `notif-${Date.now()}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      is_read: false,
      link: data.link || '/requests',
      createdAt: new Date().toISOString()
    };
    store.notifications.unshift(notif);
    saveStore();
    return notif;
  },
  markNotificationRead(id) {
    const idx = (store.notifications || []).findIndex((n) => n.id === id);
    if (idx === -1) return false;
    store.notifications[idx].is_read = true;
    saveStore();
    return true;
  },
  markAllNotificationsRead(userId) {
    (store.notifications || []).forEach((n) => {
      if (!userId || n.userId === userId) {
        n.is_read = true;
      }
    });
    saveStore();
    return true;
  },

  // DEPARTMENTS
  getDepartments() {
    return store.departments || [];
  },
  createDepartment(data) {
    const dept = {
      id: data.id || `dept-${Date.now()}`,
      name: data.name,
      fullName: data.fullName || data.name,
      code: data.code || data.name.substring(0, 3).toUpperCase()
    };
    store.departments.push(dept);
    saveStore();
    return dept;
  },
  deleteDepartment(id) {
    const idx = (store.departments || []).findIndex((d) => d.id === id);
    if (idx === -1) return false;
    store.departments.splice(idx, 1);
    saveStore();
    return true;
  },

  // AUDIT LOGS
  getAuditLogs() {
    return (store.auditLogs || []).slice(0, 100);
  },
  createAuditLog({ actorId, actorName, actorRole, action, entity, details }) {
    const log = {
      id: `log-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actorId: actorId || 'sys',
      actorName: actorName || 'System',
      actorRole: actorRole || 'system',
      action,
      entity,
      details,
      createdAt: new Date().toISOString()
    };
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift(log);
    if (store.auditLogs.length > 200) store.auditLogs.pop();
    saveStore();
    return log;
  }
};
