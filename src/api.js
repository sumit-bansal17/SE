// API Client for SnapLocate Academic Backend
// Communicates with Express API at /api, with robust local fallback

const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] ${endpoint} request failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  // Classrooms
  getClassrooms: () => fetchJson('/classrooms'),
  createClassroom: (data) => fetchJson('/classrooms', { method: 'POST', body: JSON.stringify(data) }),
  updateClassroom: (id, data) => fetchJson(`/classrooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClassroom: (id) => fetchJson(`/classrooms/${id}`, { method: 'DELETE' }),

  // Professors
  getProfessors: () => fetchJson('/professors'),
  getProfessor: (id) => fetchJson(`/professors/${id}`),
  createProfessor: (data) => fetchJson('/professors', { method: 'POST', body: JSON.stringify(data) }),
  updateProfessor: (id, data) => fetchJson(`/professors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfessor: (id) => fetchJson(`/professors/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: () => fetchJson('/students'),
  createStudent: (data) => fetchJson('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => fetchJson(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => fetchJson(`/students/${id}`, { method: 'DELETE' }),
  importStudentsCsv: (csvData) => fetchJson('/students/import-csv', { method: 'POST', body: JSON.stringify({ csvData }) }),

  // Timetables
  getTimetable: (ownerId) => fetchJson(`/timetables/${ownerId}`),
  saveTimetableEntry: (entry) => fetchJson('/timetables/entry', { method: 'POST', body: JSON.stringify(entry) }),
  deleteTimetableEntry: (id) => fetchJson(`/timetables/entry/${id}`, { method: 'DELETE' }),
  bulkSaveTimetable: (ownerId, entries) => fetchJson('/timetables/bulk', { method: 'POST', body: JSON.stringify({ ownerId, entries }) }),

  // Meeting Requests
  getRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJson(`/requests${q ? `?${q}` : ''}`);
  },
  checkConflict: (professorId, studentId, date, timeSlot) => {
    const q = new URLSearchParams({ professorId, studentId: studentId || '', date, timeSlot }).toString();
    return fetchJson(`/requests/check-conflict?${q}`);
  },
  createRequest: async (formData) => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      body: formData // multer handles multipart
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Failed to submit request');
    }
    return res.json();
  },
  updateRequest: (id, updates) =>
    fetchJson(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Workspace
  getWorkspace: (ownerId) => fetchJson(`/workspace/${ownerId}`),
  createTask: (ownerId, data) => fetchJson(`/workspace/${ownerId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, updates) => fetchJson(`/workspace/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteTask: (id) => fetchJson(`/workspace/tasks/${id}`, { method: 'DELETE' }),

  createNote: (ownerId, data) => fetchJson(`/workspace/${ownerId}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, updates) => fetchJson(`/workspace/notes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteNote: (id) => fetchJson(`/workspace/notes/${id}`, { method: 'DELETE' }),

  createLink: (ownerId, data) => fetchJson(`/workspace/${ownerId}/links`, { method: 'POST', body: JSON.stringify(data) }),
  deleteLink: (id) => fetchJson(`/workspace/links/${id}`, { method: 'DELETE' }),

  uploadFile: async (ownerId, fileObj) => {
    const fd = new FormData();
    fd.append('file', fileObj);
    const res = await fetch(`${API_BASE}/workspace/${ownerId}/files`, {
      method: 'POST',
      body: fd
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'File upload failed');
    }
    return res.json();
  },
  deleteFile: (id) => fetchJson(`/workspace/files/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (userId) => fetchJson(`/notifications/${userId}`),
  markNotificationRead: (id) => fetchJson(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (userId) => fetchJson(`/notifications/${userId}/read-all`, { method: 'POST' }),

  // Departments
  getDepartments: () => fetchJson('/departments'),
  createDepartment: (data) => fetchJson('/departments', { method: 'POST', body: JSON.stringify(data) }),
  deleteDepartment: (id) => fetchJson(`/departments/${id}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: () => fetchJson('/audit-logs'),

  // System Reset
  resetSystem: () => fetchJson('/system/reset', { method: 'POST' })
};
