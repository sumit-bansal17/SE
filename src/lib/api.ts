// Central API Client for TIET-Sync
// Handles auth token, headers, base URL from env, error normalization, and 401 redirects

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export function getToken(): string | null {
  return localStorage.getItem('tiet_sync_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('tiet_sync_token', token);
  } else {
    localStorage.removeItem('tiet_sync_token');
  }
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (res.status === 401) {
      setToken(null);
      localStorage.removeItem('tiet_sync_academic_user');
      // If not already on auth page, redirect
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[API] ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  register: async (userData: any) => {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
      localStorage.removeItem('tiet_sync_academic_user');
    }
  },

  getMe: () => fetchApi('/auth/me'),
  changePassword: (data: any) => fetchApi('/auth/change-password', { method: 'PATCH', body: JSON.stringify(data) }),

  // Classrooms
  getClassrooms: (params?: any) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return fetchApi(`/classrooms${q ? `?${q}` : ''}`);
  },
  getClassroom: (id: string) => fetchApi(`/classrooms/${id}`),
  createClassroom: (data: any) => fetchApi('/admin/classrooms', { method: 'POST', body: JSON.stringify(data) }),
  updateClassroom: (id: string, data: any) => fetchApi(`/admin/classrooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClassroom: (id: string) => fetchApi(`/admin/classrooms/${id}`, { method: 'DELETE' }),

  // Professors
  getProfessors: (params?: any) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return fetchApi(`/professors${q ? `?${q}` : ''}`);
  },
  getProfessor: (id: string) => fetchApi(`/professors/${id}`),
  updateMyProfile: (data: any) => fetchApi('/professors/me', { method: 'PATCH', body: JSON.stringify(data) }),
  createProfessor: (data: any) => fetchApi('/admin/professors', { method: 'POST', body: JSON.stringify(data) }),
  updateProfessor: (id: string, data: any) => fetchApi(`/admin/professors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfessor: (id: string) => fetchApi(`/admin/professors/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: () => fetchApi('/admin/students'),
  createStudent: (data: any) => fetchApi('/admin/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) => fetchApi(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: string) => fetchApi(`/admin/students/${id}`, { method: 'DELETE' }),
  importStudentsCsv: (csvData: string) => fetchApi('/admin/students/import', { method: 'POST', body: JSON.stringify({ csvData }) }),

  // Timetables
  getTimetable: (ownerId: string) => fetchApi(`/timetables/${ownerId}`),
  getMyTimetable: () => fetchApi('/timetable/me'),
  saveTimetableEntry: (entry: any) => fetchApi('/timetables/entry', { method: 'POST', body: JSON.stringify(entry) }),
  deleteTimetableEntry: (id: string) => fetchApi(`/timetables/entry/${id}`, { method: 'DELETE' }),
  bulkSaveTimetable: (ownerId: string, entries: any[]) => fetchApi('/timetables/bulk', { method: 'POST', body: JSON.stringify({ ownerId, entries }) }),
  getProfessorAvailability: (profId: string, date: string) => fetchApi(`/timetable/professors/${profId}/availability?date=${date}`),

  // Meeting Requests
  getRequests: (params: any = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchApi(`/requests${q ? `?${q}` : ''}`);
  },
  checkConflict: (professorId: string, studentId: string, date: string, timeSlot: string) => {
    const q = new URLSearchParams({ professorId, studentId: studentId || '', date, timeSlot }).toString();
    return fetchApi(`/requests/check-conflict?${q}`);
  },
  createRequest: async (formData: FormData) => {
    return fetchApi('/requests', {
      method: 'POST',
      body: formData,
    });
  },
  updateRequest: (id: string, updates: any) =>
    fetchApi(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  acceptRequest: (id: string, remark?: string) =>
    fetchApi(`/requests/${id}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ professorRemark: remark }),
    }),
  rejectRequest: (id: string, remark?: string) =>
    fetchApi(`/requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ remark }),
    }),
  suggestRequestTime: (id: string, proposed: any) =>
    fetchApi(`/requests/${id}/suggest-time`, {
      method: 'PATCH',
      body: JSON.stringify(proposed),
    }),
  cancelRequest: (id: string) =>
    fetchApi(`/requests/${id}/cancel`, {
      method: 'PATCH',
    }),

  // Workspace
  getWorkspace: (ownerId: string) => fetchApi(`/workspace/${ownerId}`),
  createTask: (ownerId: string, data: any) => fetchApi(`/workspace/${ownerId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, updates: any) => fetchApi(`/workspace/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteTask: (id: string) => fetchApi(`/workspace/tasks/${id}`, { method: 'DELETE' }),

  createNote: (ownerId: string, data: any) => fetchApi(`/workspace/${ownerId}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, updates: any) => fetchApi(`/workspace/notes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteNote: (id: string) => fetchApi(`/workspace/notes/${id}`, { method: 'DELETE' }),

  createLink: (ownerId: string, data: any) => fetchApi(`/workspace/${ownerId}/links`, { method: 'POST', body: JSON.stringify(data) }),
  deleteLink: (id: string) => fetchApi(`/workspace/links/${id}`, { method: 'DELETE' }),

  uploadFile: async (ownerId: string, fileObj: File) => {
    const fd = new FormData();
    fd.append('file', fileObj);
    return fetchApi(`/workspace/${ownerId}/files`, {
      method: 'POST',
      body: fd,
    });
  },
  deleteFile: (id: string) => fetchApi(`/workspace/files/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (userId: string) => fetchApi(`/notifications/${userId}`),
  markNotificationRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (userId: string) => fetchApi(`/notifications/${userId}/read-all`, { method: 'POST' }),

  // Departments
  getDepartments: () => fetchApi('/departments'),
  createDepartment: (data: any) => fetchApi('/departments', { method: 'POST', body: JSON.stringify(data) }),
  deleteDepartment: (id: string) => fetchApi(`/departments/${id}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: () => fetchApi('/audit-logs'),

  // Dashboards
  getStudentDashboard: () => fetchApi('/dashboard/student'),
  getProfessorDashboard: () => fetchApi('/dashboard/professor'),
  getAdminDashboard: () => fetchApi('/dashboard/admin'),

  // System Reset
  resetSystem: () => fetchApi('/system/reset', { method: 'POST' }),
};

export default api;
