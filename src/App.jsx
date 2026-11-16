import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Bell, BookOpen, Briefcase, CalendarDays, ClipboardList, DoorOpen,
  FileStack, GraduationCap, LayoutDashboard, MapPin, Menu, Search, Settings,
  Users, X, Check, Clock, Plus, Navigation, CheckCircle, AlertCircle, LogOut,
  ArrowRight, UserCheck, ShieldCheck, Download, Upload, Trash2, Edit3,
  Calendar, Info, AlertTriangle, ExternalLink, FileText, Filter, CheckSquare,
  Square, RefreshCw, BarChart3, Database, Shield, Layers, ChevronRight, Eye
} from 'lucide-react';

import {
  timeSlots, daysOfWeek, defaultStudent, defaultProfessor, defaultAdmin,
  initialClassrooms, initialProfessors, initialStudents, initialTimetable,
  initialRequests, initialTasks, initialNotes, initialLinks, initialFiles,
  initialNotifications, initialDepartments, initialAuditLogs
} from './data';
import { api } from './api';

// ==========================================
// 1. GLOBAL STATE & CONTEXT
// ==========================================
const AppContext = createContext();

export function AppProvider({ children }) {
  // Current user (Student by default for instant preview)
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('snaplocate_academic_user');
    return s ? JSON.parse(s) : defaultStudent;
  });

  // State collections with localStorage persistence
  const [classrooms, setClassrooms] = useState(() => {
    const s = localStorage.getItem('snaplocate_classrooms');
    return s ? JSON.parse(s) : initialClassrooms;
  });

  const [professors, setProfessors] = useState(() => {
    const s = localStorage.getItem('snaplocate_professors');
    return s ? JSON.parse(s) : initialProfessors;
  });

  const [students, setStudents] = useState(() => {
    const s = localStorage.getItem('snaplocate_students');
    return s ? JSON.parse(s) : initialStudents;
  });

  const [timetables, setTimetables] = useState(() => {
    const s = localStorage.getItem('snaplocate_timetables');
    return s ? JSON.parse(s) : initialTimetable;
  });

  const [meetingRequests, setMeetingRequests] = useState(() => {
    const s = localStorage.getItem('snaplocate_requests');
    return s ? JSON.parse(s) : initialRequests;
  });

  const [tasks, setTasks] = useState(() => {
    const s = localStorage.getItem('snaplocate_tasks');
    return s ? JSON.parse(s) : initialTasks;
  });

  const [notes, setNotes] = useState(() => {
    const s = localStorage.getItem('snaplocate_notes');
    return s ? JSON.parse(s) : initialNotes;
  });

  const [links, setLinks] = useState(() => {
    const s = localStorage.getItem('snaplocate_links');
    return s ? JSON.parse(s) : initialLinks;
  });

  const [files, setFiles] = useState(() => {
    const s = localStorage.getItem('snaplocate_files');
    return s ? JSON.parse(s) : initialFiles;
  });

  const [notifications, setNotifications] = useState(() => {
    const s = localStorage.getItem('snaplocate_notifications');
    return s ? JSON.parse(s) : initialNotifications;
  });

  const [departments, setDepartments] = useState(() => {
    const s = localStorage.getItem('snaplocate_departments');
    return s ? JSON.parse(s) : initialDepartments;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const s = localStorage.getItem('snaplocate_audit_logs');
    return s ? JSON.parse(s) : initialAuditLogs;
  });

  // Persist to local storage
  useEffect(() => { localStorage.setItem('snaplocate_academic_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('snaplocate_classrooms', JSON.stringify(classrooms)); }, [classrooms]);
  useEffect(() => { localStorage.setItem('snaplocate_professors', JSON.stringify(professors)); }, [professors]);
  useEffect(() => { localStorage.setItem('snaplocate_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('snaplocate_timetables', JSON.stringify(timetables)); }, [timetables]);
  useEffect(() => { localStorage.setItem('snaplocate_requests', JSON.stringify(meetingRequests)); }, [meetingRequests]);
  useEffect(() => { localStorage.setItem('snaplocate_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('snaplocate_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('snaplocate_links', JSON.stringify(links)); }, [links]);
  useEffect(() => { localStorage.setItem('snaplocate_files', JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem('snaplocate_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('snaplocate_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('snaplocate_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Sync with backend API on mount
  useEffect(() => {
    async function syncData() {
      try {
        const [cls, profs, studs, depts, logs] = await Promise.all([
          api.getClassrooms().catch(() => null),
          api.getProfessors().catch(() => null),
          api.getStudents().catch(() => null),
          api.getDepartments().catch(() => null),
          api.getAuditLogs().catch(() => null)
        ]);
        if (cls) setClassrooms(cls);
        if (profs) setProfessors(profs);
        if (studs) setStudents(studs);
        if (depts) setDepartments(depts);
        if (logs) setAuditLogs(logs);
      } catch (err) {
        console.log('Using local store fallback:', err);
      }
    }
    syncData();
  }, []);

  // Helper actions
  const loginUser = (userData) => {
    setUser(userData);
    addAuditLog('USER_LOGIN', userData.name, userData.role, `Logged in to ${userData.role} portal`);
  };

  const logoutUser = () => {
    if (user) addAuditLog('USER_LOGOUT', user.name, user.role, 'Signed out of session');
    setUser(null);
  };

  const addAuditLog = (action, actorName, actorRole, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      actorName: actorName || user?.name || 'System',
      actorRole: actorRole || user?.role || 'system',
      action,
      entity: 'System',
      details,
      createdAt: new Date().toISOString()
    };
    setAuditLogs((p) => [newLog, ...p]);
  };

  const addNotification = (userId, title, message, link = '/requests') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      is_read: false,
      link,
      createdAt: new Date().toISOString()
    };
    setNotifications((p) => [newNotif, ...p]);
  };

  // Conflict Checking Engine
  const checkSlotConflict = (professorId, studentId, date, timeSlot) => {
    if (!date || !timeSlot) return { hasConflict: false, reason: null };
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(date);
    const day = isNaN(d.getDay()) ? 'Monday' : days[d.getDay()];

    // 1. Professor already has an accepted meeting at this slot
    const profBusyMeeting = meetingRequests.find(
      (r) => r.professorId === professorId && r.date === date && r.timeSlot === timeSlot && r.status === 'accepted'
    );
    if (profBusyMeeting) {
      return {
        hasConflict: true,
        reason: `Professor already has an accepted consultation booked on ${date} at ${timeSlot}.`
      };
    }

    // 2. Professor has a scheduled class in timetable
    const profClass = timetables.find(
      (t) => t.ownerId === professorId && t.day.toLowerCase() === day.toLowerCase() && t.timeSlot === timeSlot
    );
    if (profClass) {
      return {
        hasConflict: true,
        reason: `Professor is teaching "${profClass.subject}" in ${profClass.roomName || 'Classroom'} on ${day}s at ${timeSlot}.`
      };
    }

    // 3. Student has conflict
    if (studentId) {
      const studentBusyMeeting = meetingRequests.find(
        (r) => r.studentId === studentId && r.date === date && r.timeSlot === timeSlot && r.status === 'accepted'
      );
      if (studentBusyMeeting) {
        return {
          hasConflict: true,
          reason: `You already have an accepted meeting on ${date} at ${timeSlot}.`
        };
      }

      const studentClass = timetables.find(
        (t) => t.ownerId === studentId && t.day.toLowerCase() === day.toLowerCase() && t.timeSlot === timeSlot
      );
      if (studentClass) {
        return {
          hasConflict: true,
          reason: `Schedule conflict: You have scheduled class "${studentClass.subject}" on ${day} at ${timeSlot}.`
        };
      }
    }

    return { hasConflict: false, reason: null };
  };

  // File Storage Quota (20 MB per user)
  const getUserQuota = (userId) => {
    const userFiles = files.filter((f) => f.ownerId === (userId || user?.id));
    const usedMB = userFiles.reduce((acc, f) => acc + (parseFloat(f.size) || 0), 0);
    const rounded = Math.round(usedMB * 100) / 100;
    return {
      usedMB: rounded,
      maxMB: 20.0,
      percentage: Math.min(100, Math.round((rounded / 20.0) * 100))
    };
  };

  return (
    <AppContext.Provider value={{
      user, loginUser, logoutUser,
      classrooms, setClassrooms,
      professors, setProfessors,
      students, setStudents,
      timetables, setTimetables,
      meetingRequests, setMeetingRequests,
      tasks, setTasks,
      notes, setNotes,
      links, setLinks,
      files, setFiles,
      notifications, setNotifications,
      departments, setDepartments,
      auditLogs, setAuditLogs,
      checkSlotConflict,
      getUserQuota,
      addNotification,
      addAuditLog
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

// ==========================================
// 2. MAIN LAYOUT (THAPAR ACADEMIC RED)
// ==========================================
function PageLayout({ children }) {
  const { user, logoutUser, notifications, setNotifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const isAuthPage = location.pathname.startsWith('/auth');
  if (isAuthPage) {
    return <div className="min-h-screen bg-background text-on-surface font-roboto">{children}</div>;
  }

  // Filter unread notifications for current user
  const userNotifs = notifications.filter((n) => !user || n.userId === user.id);
  const unreadCount = userNotifs.filter((n) => !n.is_read).length;

  const markNotificationRead = (id) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((p) => p.map((n) => (!user || n.userId === user.id ? { ...n, is_read: true } : n)));
  };

  // Role based Navbars
  const studentNav = [
    { section: 'OVERVIEW' },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { section: 'ACADEMIC' },
    { label: 'Classroom', path: '/classroom', icon: DoorOpen },
    { label: 'Work-Space', path: '/workspace', icon: Briefcase },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'My Requests', path: '/requests', icon: ClipboardList },
    { label: 'Professor', path: '/professors', icon: Users },
  ];

  const professorNav = [
    { section: 'OVERVIEW' },
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { section: 'ACADEMIC' },
    { label: 'Classroom', path: '/classroom', icon: DoorOpen },
    { label: 'Work-Space', path: '/workspace', icon: Briefcase },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Meeting Requests', path: '/requests', icon: ClipboardList },
    { label: 'Students', path: '/students', icon: GraduationCap },
  ];

  const adminNav = [
    { section: 'OVERVIEW' },
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { section: 'MANAGEMENT' },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Professors', path: '/admin/professors', icon: Users },
    { label: 'Classrooms', path: '/admin/classrooms', icon: DoorOpen },
    { label: 'Meeting Requests', path: '/admin/requests', icon: ClipboardList },
    { label: 'Timetables', path: '/admin/timetables', icon: Briefcase },
    { label: 'Departments', path: '/admin/departments', icon: Layers },
    { label: 'Audit Log', path: '/admin/audit-log', icon: ShieldCheck },
  ];

  let currentNav = studentNav;
  if (user?.role === 'professor') currentNav = professorNav;
  if (user?.role === 'admin') currentNav = adminNav;

  return (
    <div className="min-h-screen bg-background text-on-surface font-roboto flex flex-col selection:bg-primary selection:text-white">
      {/* Institutional Header */}
      <header className="sticky top-0 w-full h-[64px] bg-surface border-b border-neutral z-50 px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setMobileMenuOpen(true)} className="flex lg:hidden p-2 rounded-none bg-transparent border-none cursor-pointer text-secondary hover:bg-neutral/30">
            <Menu size={22} />
          </button>
          <div onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'professor' ? '/faculty/dashboard' : '/dashboard')} className="flex items-center gap-3 cursor-pointer select-none">
            <img src="/images/tiet-sync-location-pin-logo.webp" alt="TIET-Sync" className="w-[116px] h-auto object-contain" />
            <span className="text-[11px] font-normal tracking-wide text-secondary border-l border-neutral pl-2 uppercase">Campus OS</span>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 rounded-none bg-transparent border-none cursor-pointer text-secondary hover:bg-neutral/40 transition-colors" title="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-none bg-primary text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="fixed sm:absolute top-[64px] sm:top-10 right-2 sm:right-0 sm:w-[340px] bg-surface border border-neutral shadow-lg z-50">
                <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-neutral bg-muted">
                  <span className="label-sm uppercase font-normal text-secondary">Academic Notices ({unreadCount})</span>
                  {unreadCount > 0 && <button onClick={markAllNotificationsRead} className="btn-tertiary text-xs">Mark all read</button>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-neutral">
                  {userNotifs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-secondary/60">No academic notifications.</div>
                  ) : (
                    userNotifs.map((n) => (
                      <div key={n.id} onClick={() => { markNotificationRead(n.id); navigate(n.link || '/requests'); setNotificationsOpen(false); }} className={`p-3 cursor-pointer hover:bg-muted transition-colors ${n.is_read ? 'opacity-70' : 'bg-muted/40 font-medium'}`}>
                        <div className="text-xs text-primary">{n.title}</div>
                        <div className="text-xs text-secondary mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-secondary/50 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-neutral" />

          {/* User Profile Pill & Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="text-xs font-normal text-secondary">{user.name}</div>
                <div className="text-[10px] font-normal text-primary uppercase tracking-wider">{user.role}</div>
              </div>
              <span className={user.role === 'admin' ? 'chip-academic-maroon text-[10px]' : user.role === 'professor' ? 'chip-academic-maroon text-[10px]' : 'chip-academic text-[10px]'}>
                {user.role.toUpperCase()}
              </span>
              <button onClick={() => { logoutUser(); navigate('/auth'); }} className="btn-secondary text-xs h-[30px] px-2.5 flex items-center gap-1.5" title="Sign Out">
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-primary text-xs text-decoration-none">Sign In</Link>
          )}
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex w-full max-w-[1550px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[230px] shrink-0 border-r border-neutral py-6 px-3 bg-surface sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {currentNav.map((item, idx) => {
              if (item.section) return <div key={idx} className="label-sm uppercase font-normal text-secondary/70 px-3 pt-4 pb-1 tracking-wider">{item.section}</div>;
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/dashboard' || item.path === '/faculty/dashboard' || item.path === '/admin/dashboard'}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-2 text-xs font-normal transition-colors no-underline ${isActive ? 'bg-primary text-white font-medium' : 'text-secondary hover:bg-neutral/40'}`}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-secondary'} />
                      <span>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-secondary/40" />
            <div className="relative w-[260px] bg-surface h-full shadow-lg p-5 z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center pb-3 border-b border-neutral">
                <div className="font-bold text-primary text-base">TIET-Sync</div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-secondary bg-transparent border-none cursor-pointer"><X size={18} /></button>
              </div>
              {currentNav.map((item, idx) => {
                if (item.section) return <div key={idx} className="text-[11px] font-normal uppercase text-secondary/70 px-2 pt-3">{item.section}</div>;
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 text-xs font-normal transition-colors no-underline ${isActive ? 'bg-primary text-white font-medium' : 'text-secondary hover:bg-neutral/40'}`}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 3. AUTHENTICATION & SEPARATE LOGIN/SIGNUP PAGES
// ==========================================
function AuthGateway() {
  const navigate = useNavigate();
  const { loginUser } = useApp();

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-surface border border-neutral p-6 sm:p-10 shadow-sm">
        <div className="text-center pb-6 border-b border-neutral">
          <div className="flex justify-center items-center gap-3 mb-2">
            <img src="/images/tiet-sync-location-pin-logo.webp" alt="TIET-Sync" className="w-[210px] h-auto object-contain" />
          </div>
          <p className="body-md text-secondary">Campus OS • Student-Faculty Academic Consultation & Timetable Hub</p>
        </div>

        {/* 3 Portal Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {/* Student Portal */}
          <div className="border border-neutral p-5 flex flex-col justify-between hover:border-primary transition-colors bg-white">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                <GraduationCap size={18} /> Student Portal
              </div>
              <p className="text-xs text-secondary/80 leading-relaxed">
                Access your 13-period timetable, discover classrooms, check professor availability, and book consultations.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/auth/student-login" className="btn-primary w-full text-center text-xs justify-center no-underline">
                Student Sign In
              </Link>
              <Link to="/auth/student-signup" className="btn-secondary w-full text-center text-xs justify-center no-underline border border-neutral">
                New Student Register
              </Link>
            </div>
          </div>

          {/* Faculty Portal */}
          <div className="border border-neutral p-5 flex flex-col justify-between hover:border-primary transition-colors bg-white">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                <Users size={18} /> Faculty Portal
              </div>
              <p className="text-xs text-secondary/80 leading-relaxed">
                Manage your teaching lectures, define weekly office hours, accept student appointments, and review project synopses.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/auth/professor-login" className="btn-primary w-full text-center text-xs justify-center no-underline">
                Faculty Sign In
              </Link>
              <Link to="/auth/professor-signup" className="btn-secondary w-full text-center text-xs justify-center no-underline border border-neutral">
                Faculty Registration
              </Link>
            </div>
          </div>

          {/* Admin Portal */}
          <div className="border border-neutral p-5 flex flex-col justify-between hover:border-primary transition-colors bg-white">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                <ShieldCheck size={18} /> Academic Admin
              </div>
              <p className="text-xs text-secondary/80 leading-relaxed">
                Institutional oversight: manage classrooms, master timetables, CSV student import, and inspect chronological audit logs.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/auth/admin-login" className="btn-primary w-full text-center text-xs justify-center no-underline">
                Admin Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="p-4 bg-muted border border-neutral flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-wide">Quick Instant Demo Logins</div>
            <div className="text-[11px] text-secondary">Click any button below to instantly authenticate without typing:</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { loginUser(defaultStudent); navigate('/dashboard'); }}
              className="btn-secondary text-xs h-[32px] px-3 border border-neutral bg-surface">
              Demo Student (Sumit)
            </button>
            <button
              onClick={() => { loginUser(defaultProfessor); navigate('/faculty/dashboard'); }}
              className="btn-secondary text-xs h-[32px] px-3 border border-neutral bg-surface">
              Demo Prof (Dr. Rajesh)
            </button>
            <button
              onClick={() => { loginUser(defaultAdmin); navigate('/admin/dashboard'); }}
              className="btn-secondary text-xs h-[32px] px-3 border border-neutral bg-surface">
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Login Page
function StudentLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide student email and password');
      return;
    }
    loginUser({
      ...defaultStudent,
      email,
      name: email.includes('student') ? 'Sumit Bansal' : email.split('@')[0]
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface border border-neutral p-8 shadow-sm">
        <div className="text-center pb-5 border-b border-neutral mb-6">
          <span className="chip-academic text-[10px] uppercase">Student Access</span>
          <h2 className="headline-sm text-primary mt-2">Sign in to Student Portal</h2>
          <p className="body-sm text-secondary mt-1">Manage your academic schedule & meetings</p>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Thapar Student Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Sign In as Student
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral text-center text-xs text-secondary">
          Don't have an account? <Link to="/auth/student-signup" className="text-primary font-medium hover:underline">Register here</Link>
          <div className="mt-2"><Link to="/auth" className="text-secondary/70 hover:underline">← Back to Portal Gateway</Link></div>
        </div>
      </div>
    </div>
  );
}

// Student Signup Page
function StudentSignup() {
  const navigate = useNavigate();
  const { loginUser, setStudents } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    branch: 'Computer Science & Engineering',
    year: '3rd Year (Batch 2023-2027)',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStudent = {
      id: `usr_s_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      profile: {
        rollNo: formData.rollNo,
        branch: formData.branch,
        year: formData.year
      }
    };
    setStudents((p) => [newStudent, ...p]);
    loginUser(newStudent);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-surface border border-neutral p-8 shadow-sm">
        <div className="text-center pb-5 border-b border-neutral mb-6">
          <span className="chip-academic text-[10px] uppercase">New Student Registration</span>
          <h2 className="headline-sm text-primary mt-2">Create Student Account</h2>
          <p className="body-sm text-secondary mt-1">Enroll your profile into Thapar Academic OS</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-academic w-full"
              placeholder="e.g. Sumit Bansal"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-sm text-secondary block mb-1">University Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-academic w-full"
                placeholder="name@thapar.edu"
                required
              />
            </div>
            <div>
              <label className="label-sm text-secondary block mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="input-academic w-full"
                placeholder="e.g. 102303492"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-sm text-secondary block mb-1">Department / Branch</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="input-academic w-full">
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Mechanical Engineering</option>
                <option>Mathematics & Computing</option>
              </select>
            </div>
            <div>
              <label className="label-sm text-secondary block mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="input-academic w-full"
                placeholder="3rd Year (Batch 2023-2027)"
              />
            </div>
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Create Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-academic w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-3">
            Register & Sign In
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral text-center text-xs text-secondary">
          Already registered? <Link to="/auth/student-login" className="text-primary font-medium hover:underline">Sign In here</Link>
          <div className="mt-2"><Link to="/auth" className="text-secondary/70 hover:underline">← Back to Portal Gateway</Link></div>
        </div>
      </div>
    </div>
  );
}

// Professor Login Page
function ProfessorLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [email, setEmail] = useState('professor@demo.com');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      ...defaultProfessor,
      email,
      name: email.includes('professor') ? 'Dr. Rajesh Kumar' : 'Faculty Member'
    });
    navigate('/faculty/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface border border-neutral p-8 shadow-sm">
        <div className="text-center pb-5 border-b border-neutral mb-6">
          <span className="chip-academic-maroon text-[10px] uppercase">Faculty Portal</span>
          <h2 className="headline-sm text-primary mt-2">Sign in as Professor</h2>
          <p className="body-sm text-secondary mt-1">Review student consultation requests & timetable</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Faculty Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Sign In to Faculty Desk
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral text-center text-xs text-secondary">
          New faculty member? <Link to="/auth/professor-signup" className="text-primary font-medium hover:underline">Register Profile</Link>
          <div className="mt-2"><Link to="/auth" className="text-secondary/70 hover:underline">← Back to Portal Gateway</Link></div>
        </div>
      </div>
    </div>
  );
}

// Professor Signup Page
function ProfessorSignup() {
  const navigate = useNavigate();
  const { loginUser, setProfessors } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teacherCode: '',
    department: 'CSED',
    designation: 'ASSOCIATE',
    officeLocation: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProf = {
      id: `usr_p_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'professor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      profile: {
        teacherCode: formData.teacherCode || `TCH-${Date.now().toString().slice(-4)}`,
        department: formData.department,
        designation: formData.designation,
        officeLocation: formData.officeLocation || 'Block C, Faculty Wing',
        officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
        bio: 'Faculty member & researcher.',
        isOnline: true
      }
    };
    setProfessors((p) => [newProf, ...p]);
    loginUser(newProf);
    navigate('/faculty/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-surface border border-neutral p-8 shadow-sm">
        <div className="text-center pb-5 border-b border-neutral mb-6">
          <span className="chip-academic-maroon text-[10px] uppercase">Faculty Registration</span>
          <h2 className="headline-sm text-primary mt-2">Register Faculty Profile</h2>
          <p className="body-sm text-secondary mt-1">Publish your academic directory listing</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Full Title & Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-academic w-full"
              placeholder="e.g. Dr. Rajesh Kumar"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-sm text-secondary block mb-1">Institutional Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-academic w-full"
                placeholder="name@thapar.edu"
                required
              />
            </div>
            <div>
              <label className="label-sm text-secondary block mb-1">Teacher Code</label>
              <input
                type="text"
                value={formData.teacherCode}
                onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                className="input-academic w-full"
                placeholder="e.g. TCH-CSE-09"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-sm text-secondary block mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-academic w-full">
                <option value="CSED">CSED (Computer Science)</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>
            <div>
              <label className="label-sm text-secondary block mb-1">Designation</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="input-academic w-full">
                <option value="PROFESSOR">Professor</option>
                <option value="ASSOCIATE">Associate Professor</option>
                <option value="ASSISTANT">Assistant Professor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Office / Cabin Location</label>
            <input
              type="text"
              value={formData.officeLocation}
              onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
              className="input-academic w-full"
              placeholder="e.g. Cabin C-314, Block C (3rd Floor)"
              required
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Create Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-academic w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-3">
            Register Faculty Account
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral text-center text-xs text-secondary">
          Already registered? <Link to="/auth/professor-login" className="text-primary font-medium hover:underline">Sign In here</Link>
          <div className="mt-2"><Link to="/auth" className="text-secondary/70 hover:underline">← Back to Portal Gateway</Link></div>
        </div>
      </div>
    </div>
  );
}

// Admin Login Page
function AdminLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(defaultAdmin);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface border border-neutral p-8 shadow-sm">
        <div className="text-center pb-5 border-b border-neutral mb-6">
          <span className="chip-academic-maroon text-[10px] uppercase">Administrative Access</span>
          <h2 className="headline-sm text-primary mt-2">Academic Administration</h2>
          <p className="body-sm text-secondary mt-1">Dean Office System Control</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary block mb-1">Administrator Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <div>
            <label className="label-sm text-secondary block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-academic w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Authenticate as Admin
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral text-center text-xs text-secondary">
          <Link to="/auth" className="text-secondary/70 hover:underline">← Back to Portal Gateway</Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. STUDENT DASHBOARD
// ==========================================
function StudentDashboard() {
  const { user, timetables, tasks, setTasks, meetingRequests } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scheduleToggle, setScheduleToggle] = useState('day'); // 'day' | 'week'
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDayName = daysOfWeek[currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1]; // Mon-Sun index

  // Student classes today
  const myClassesToday = useMemo(() => {
    return timetables
      .filter((t) => t.ownerId === (user?.id || 'usr_student_demo') && t.day.toLowerCase() === currentDayName.toLowerCase())
      .sort((a, b) => a.periodIndex - b.periodIndex);
  }, [timetables, user, currentDayName]);

  // Next upcoming class today
  const nextClass = myClassesToday.length > 0 ? myClassesToday[0] : null;

  // Toggle task
  const toggleTask = (id) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)));
  };

  const studentTasks = tasks.filter((t) => !t.ownerId || t.ownerId === user?.id);
  const pendingTasks = studentTasks.filter((t) => !t.is_done);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Sumit'} 👋
          </h1>
          <p className="body-md text-secondary mt-0.5">Here is what is happening on campus today.</p>
        </div>

        {/* Date and Live Time Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-muted border border-neutral text-xs font-normal text-secondary">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="px-3 py-1.5 bg-surface border border-primary text-xs font-mono font-bold text-primary flex items-center gap-1.5">
            <Clock size={13} className="text-primary animate-pulse" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Grid: Next Class & Tasks Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Next Class Card */}
        <div className="lg:col-span-2 card-academic p-6 flex flex-col justify-between border-l-4 border-l-primary bg-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="chip-academic-maroon text-[10px] uppercase">Next Class</span>
              <span className="label-sm text-secondary/70">Academic Timetable</span>
            </div>

            {nextClass ? (
              <div className="mt-4">
                <h3 className="headline-sm text-secondary font-light">{nextClass.subject}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-secondary">
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Clock size={14} /> {nextClass.timeSlot}
                  </span>
                  <span className="flex items-center gap-1">
                    <DoorOpen size={14} /> {nextClass.roomName || 'Classroom LT 101'}
                  </span>
                  {nextClass.professorName && (
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {nextClass.professorName}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 py-6 text-center">
                <div className="text-2xl mb-1">💤</div>
                <div className="title-md text-secondary font-normal">No more classes today. Catch up on rest! 💤</div>
                <div className="label-sm text-secondary/60 mt-1">Check your weekly Work-Space for upcoming scheduled periods.</div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral flex justify-between items-center">
            <span className="label-sm text-secondary/70">Status: Enrolled Regular Session</span>
            <button onClick={() => navigate('/workspace')} className="btn-secondary text-xs flex items-center gap-1">
              <span>Open Work-Space Timetable</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Tasks Hub Card */}
        <div className="card-academic p-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="title-md text-secondary font-normal">Tasks Hub</h2>
              <button onClick={() => navigate('/workspace')} className="btn-tertiary text-xs">View All</button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-2xl mb-1">🎉</div>
                <div className="body-sm text-secondary font-medium">No pending tasks! 🎉</div>
                <div className="label-sm text-secondary/60 mt-0.5">All coursework deliverables are up to date.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto">
                {pendingTasks.slice(0, 4).map((tsk) => (
                  <div key={tsk.id} className="flex items-start gap-2.5 p-2 bg-muted/40 border border-neutral hover:border-neutral/80 transition-colors">
                    <button onClick={() => toggleTask(tsk.id)} className="mt-0.5 text-secondary hover:text-primary bg-transparent border-none p-0 cursor-pointer">
                      {tsk.is_done ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-normal text-secondary leading-snug line-clamp-1">{tsk.label}</div>
                      <div className="label-sm text-secondary/60 mt-0.5 flex justify-between">
                        <span>{tsk.category || 'Academic'}</span>
                        <span className="truncate">{tsk.sub}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/workspace')} className="btn-secondary w-full justify-center text-xs mt-3">
            + Add New Task in Work-Space
          </button>
        </div>
      </div>

      {/* Grid: Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-2 card-academic p-6 bg-white">
          <div className="flex justify-between items-center pb-3 border-b border-neutral mb-4">
            <div>
              <h2 className="title-md text-secondary font-normal">Today's Schedule</h2>
              <div className="label-sm text-secondary/70">{currentDayName} Class Periods</div>
            </div>

            {/* Day / Week Toggle */}
            <div className="flex border border-neutral">
              <button
                onClick={() => setScheduleToggle('day')}
                className={`px-3 py-1 text-xs border-none cursor-pointer ${scheduleToggle === 'day' ? 'bg-primary text-white font-medium' : 'bg-surface text-secondary'}`}>
                Day
              </button>
              <button
                onClick={() => setScheduleToggle('week')}
                className={`px-3 py-1 text-xs border-none cursor-pointer ${scheduleToggle === 'week' ? 'bg-primary text-white font-medium' : 'bg-surface text-secondary'}`}>
                Week
              </button>
            </div>
          </div>

          {scheduleToggle === 'day' ? (
            myClassesToday.length === 0 ? (
              <div className="py-10 text-center text-secondary/60 body-sm">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {myClassesToday.map((c) => (
                  <div key={c.id} className="p-3 border border-neutral flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-primary">{c.timeSlot}</span>
                        <span className="text-xs font-normal text-secondary">{c.subject}</span>
                      </div>
                      <div className="label-sm text-secondary/70 mt-0.5">
                        {c.roomName || 'LT 101'} • Instructor: {c.professorName || 'Department Faculty'}
                      </div>
                    </div>
                    <span className="chip-academic text-[10px]">Attending</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Mini Week View */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted text-secondary border-b border-neutral">
                    <th className="p-2 font-normal">Day</th>
                    <th className="p-2 font-normal">Scheduled Lectures & Labs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral">
                  {daysOfWeek.slice(0, 5).map((d) => {
                    const dayClasses = timetables.filter((t) => t.ownerId === (user?.id || 'usr_student_demo') && t.day.toLowerCase() === d.toLowerCase());
                    return (
                      <tr key={d} className="hover:bg-muted/20">
                        <td className="p-2 font-medium text-secondary whitespace-nowrap">{d}</td>
                        <td className="p-2 text-secondary">
                          {dayClasses.length === 0 ? (
                            <span className="text-secondary/40">Free Day</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {dayClasses.map((dc) => (
                                <span key={dc.id} className="px-2 py-0.5 bg-neutral text-[10px] text-secondary">
                                  {dc.timeSlot}: {dc.subject.split(':')[0]}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="card-academic p-5 bg-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="title-md text-secondary font-normal">Recent Activity</h2>
              <button onClick={() => navigate('/requests')} className="btn-tertiary text-xs">View all activity</button>
            </div>

            <div className="flex flex-col gap-3">
              {meetingRequests.slice(0, 3).map((r) => (
                <div key={r.id} className="p-2.5 bg-muted/30 border border-neutral text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">{r.professorName}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${r.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-neutral text-secondary'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-secondary/80 mt-1 line-clamp-1">{r.reason}</div>
                  <div className="label-sm text-secondary/60 mt-1 flex justify-between">
                    <span>{r.date} ({r.timeSlot})</span>
                    <span>{r.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral">
            <button onClick={() => navigate('/professors')} className="btn-primary w-full justify-center text-xs">
              Book Faculty Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. CLASSROOM DISCOVERY
// ==========================================
function ClassroomFinder() {
  const { classrooms } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [sortOption, setSortOption] = useState('az');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const blockFilters = ['All', 'Block B', 'Block TAN', 'CSED', 'Lab', 'Lecture Hall'];

  // Filter and sort
  const filteredRooms = useMemo(() => {
    return classrooms
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.block.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = selectedBlock === 'All' || c.block.toLowerCase().includes(selectedBlock.toLowerCase()) || c.type.toLowerCase().includes(selectedBlock.toLowerCase());
        return matchesSearch && matchesBlock;
      })
      .sort((a, b) => {
        if (sortOption === 'az') return a.name.localeCompare(b.name);
        if (sortOption === 'cap-desc') return b.capacity - a.capacity;
        if (sortOption === 'cap-asc') return a.capacity - b.capacity;
        return 0;
      });
  }, [classrooms, searchTerm, selectedBlock, sortOption]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Title & Subtitle */}
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Classroom Discovery</h1>
        <p className="body-md text-secondary mt-0.5">Discover and join your classes</p>
      </div>

      {/* Controls: Search, Filter Chips, Sort Dropdown */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a room, block or lab..."
              className="input-academic w-full pl-9"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="label-sm text-secondary/70 whitespace-nowrap">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input-academic text-xs">
              <option value="az">Room Name (A-Z)</option>
              <option value="cap-desc">Capacity: High to Low</option>
              <option value="cap-asc">Capacity: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {blockFilters.map((blk) => (
            <button
              key={blk}
              onClick={() => setSelectedBlock(blk)}
              className={`px-3 py-1 text-xs border border-neutral transition-colors cursor-pointer ${selectedBlock === blk ? 'bg-primary text-white font-medium border-primary' : 'bg-surface text-secondary hover:bg-neutral/40'}`}>
              {blk === 'All' ? 'All Units' : blk}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive 3-Column Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className="card-academic overflow-hidden cursor-pointer hover:border-primary transition-all flex flex-col justify-between bg-white group">
            <div>
              {/* Photo on Top with Type Badge */}
              <div className="relative h-44 w-full bg-neutral overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 chip-academic-maroon text-[10px] font-bold shadow-sm">
                  {room.type}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="title-md text-secondary font-normal group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <div className="body-sm text-secondary/70 mt-1 flex items-center gap-1">
                  <MapPin size={13} className="text-primary shrink-0" />
                  <span className="truncate">{room.location}</span>
                </div>
              </div>
            </div>

            {/* Footer with BLOCK, FLOOR, CAPACITY, CODE */}
            <div className="px-4 py-3 bg-muted/40 border-t border-neutral grid grid-cols-4 gap-2 text-center text-[10px]">
              <div>
                <div className="text-secondary/60 uppercase">Block</div>
                <div className="font-bold text-secondary truncate">{room.block}</div>
              </div>
              <div>
                <div className="text-secondary/60 uppercase">Floor</div>
                <div className="font-bold text-secondary truncate">{room.floor.replace(' Floor', '')}</div>
              </div>
              <div>
                <div className="text-secondary/60 uppercase">Capacity</div>
                <div className="font-bold text-secondary">{room.capacity}</div>
              </div>
              <div>
                <div className="text-secondary/60 uppercase">Code</div>
                <div className="font-bold text-primary">{room.code}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Classroom Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedRoom(null)} className="fixed inset-0 bg-secondary/60" />
          <div className="relative bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral p-6 shadow-xl z-10 flex flex-col gap-5">
            <div className="flex justify-between items-start pb-3 border-b border-neutral">
              <div>
                <span className="chip-academic-maroon text-[10px] uppercase">{selectedRoom.type}</span>
                <h2 className="headline-sm text-primary mt-1">{selectedRoom.name}</h2>
                <div className="label-sm text-secondary/70">{selectedRoom.location}</div>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="p-1 text-secondary bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="h-56 w-full overflow-hidden bg-neutral">
              <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted border border-neutral text-center text-xs">
              <div><span className="text-secondary/60 block text-[10px] uppercase">Code</span><strong>{selectedRoom.code}</strong></div>
              <div><span className="text-secondary/60 block text-[10px] uppercase">Block</span><strong>{selectedRoom.block}</strong></div>
              <div><span className="text-secondary/60 block text-[10px] uppercase">Floor</span><strong>{selectedRoom.floor}</strong></div>
              <div><span className="text-secondary/60 block text-[10px] uppercase">Capacity</span><strong>{selectedRoom.capacity} Seats</strong></div>
            </div>

            <div>
              <h4 className="title-md text-secondary font-normal mb-2">Amenities & Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities?.map((am, i) => (
                  <span key={i} className="chip-academic text-xs">{am}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="title-md text-secondary font-normal mb-1">How to Reach / Directions</h4>
              <p className="body-sm text-secondary leading-relaxed bg-muted/40 p-3 border border-neutral">
                {selectedRoom.directions}
              </p>
            </div>

            {/* Room Availability Timetable */}
            <div>
              <h4 className="title-md text-secondary font-normal mb-2">Room Weekly Schedule & Availability</h4>
              <div className="text-xs text-secondary/70 mb-2">Periods marked occupied indicate live academic sessions.</div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[11px] text-center">
                {timeSlots.slice(0, 7).map((slot, i) => (
                  <div key={slot} className={`p-2 border border-neutral ${i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-secondary/70'}`}>
                    <div className="font-bold">{slot}</div>
                    <div className="text-[10px]">{i % 2 === 0 ? 'Reserved' : 'Vacant'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral flex justify-end">
              <button onClick={() => setSelectedRoom(null)} className="btn-secondary text-xs">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. WORK-SPACE (WEEKLY TIMETABLE & 4 WIDGETS)
// ==========================================
function WorkspacePage() {
  const { user, timetables, setTimetables, tasks, setTasks, notes, setNotes, links, setLinks, files, setFiles, classrooms, professors, getUserQuota } = useApp();
  const [editingCell, setEditingCell] = useState(null); // { day, periodIndex, existingEntry }
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [activeNoteModal, setActiveNoteModal] = useState(null); // null or note
  const [activeTaskModal, setActiveTaskModal] = useState(false);
  const [activeLinkModal, setActiveLinkModal] = useState(false);
  const fileInputRef = useRef(null);

  const ownerId = user?.id || 'usr_student_demo';
  const myTimetable = timetables.filter((t) => t.ownerId === ownerId);
  const myTasks = tasks.filter((t) => !t.ownerId || t.ownerId === ownerId);
  const myNotes = notes.filter((t) => !t.ownerId || t.ownerId === ownerId);
  const myLinks = links.filter((t) => !t.ownerId || t.ownerId === ownerId);
  const myFiles = files.filter((t) => !t.ownerId || t.ownerId === ownerId);
  const quota = getUserQuota(ownerId);

  // Cell modal state
  const [cellSubject, setCellSubject] = useState('');
  const [cellRoom, setCellRoom] = useState('');
  const [cellProf, setCellProf] = useState('');
  const [cellColor, setCellColor] = useState('#640000');

  const openCellModal = (day, periodIndex) => {
    const existing = myTimetable.find((t) => t.day.toLowerCase() === day.toLowerCase() && t.periodIndex === periodIndex);
    setEditingCell({ day, periodIndex, existing });
    if (existing) {
      setCellSubject(existing.subject || '');
      setCellRoom(existing.roomName || '');
      setCellProf(existing.professorName || '');
      setCellColor(existing.color || '#640000');
    } else {
      setCellSubject('');
      setCellRoom(classrooms[0]?.name || 'LT 101');
      setCellProf(professors[0]?.name || 'Faculty');
      setCellColor('#640000');
    }
  };

  const handleSaveCell = (e) => {
    e.preventDefault();
    if (!editingCell) return;
    const { day, periodIndex, existing } = editingCell;

    if (existing) {
      setTimetables((p) => p.map((t) => t.id === existing.id ? {
        ...t,
        subject: cellSubject,
        roomName: cellRoom,
        professorName: cellProf,
        color: cellColor
      } : t));
    } else {
      const newEntry = {
        id: `tt-${Date.now()}`,
        ownerId,
        day,
        periodIndex,
        timeSlot: timeSlots[periodIndex],
        subject: cellSubject || 'Class Block',
        roomName: cellRoom,
        professorName: cellProf,
        color: cellColor
      };
      setTimetables((p) => [...p, newEntry]);
    }
    setEditingCell(null);
  };

  const handleDeleteCell = () => {
    if (editingCell?.existing) {
      setTimetables((p) => p.filter((t) => t.id !== editingCell.existing.id));
    }
    setEditingCell(null);
  };

  // Import timetable handler
  const handleImportTimetable = () => {
    if (!importCsvText.trim()) return;
    const lines = importCsvText.trim().split('\n');
    const newEntries = [];
    lines.forEach((line) => {
      const parts = line.split(',').map((s) => s.trim());
      if (parts.length >= 3) {
        const [day, slotIndexStr, subject, roomName, professorName] = parts;
        const pIdx = parseInt(slotIndexStr) || 0;
        newEntries.push({
          id: `tt-imp-${Date.now()}_${Math.random()}`,
          ownerId,
          day: day || 'Monday',
          periodIndex: pIdx,
          timeSlot: timeSlots[pIdx] || '8:50-9:40',
          subject: subject || 'Imported Course',
          roomName: roomName || 'LT 101',
          professorName: professorName || 'Faculty',
          color: '#640000'
        });
      }
    });

    if (newEntries.length > 0) {
      setTimetables((p) => [...p.filter((t) => t.ownerId !== ownerId), ...newEntries]);
      alert(`Successfully imported ${newEntries.length} timetable periods!`);
    }
    setIsImportModalOpen(false);
    setImportCsvText('');
  };

  // Upload file with 20MB quota check
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100;
    if (quota.usedMB + fileSizeMB > quota.maxMB) {
      alert(`Upload blocked: Storage quota exceeded! You have ${quota.usedMB} MB used of 20 MB max.`);
      return;
    }
    const newFile = {
      id: `file-${Date.now()}`,
      ownerId,
      name: file.name,
      size: fileSizeMB,
      url: '#'
    };
    setFiles((p) => [newFile, ...p]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">Work-Space</h1>
          <p className="body-md text-secondary mt-0.5">My Weekly Timetable & Academic Desk</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-1.5 border border-neutral">
            <Download size={14} /> Download (PDF/Print)
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5">
            <Upload size={14} /> Import official timetable
          </button>
        </div>
      </div>

      {/* Hint Text */}
      <div className="p-3 bg-muted border border-neutral flex items-center gap-2 text-xs text-secondary">
        <Info size={15} className="text-primary shrink-0" />
        <span>Click any cell to add or edit a class block. Your timetable automatically synchronizes with the consultation conflict checker.</span>
      </div>

      {/* 13-Period Weekly Timetable Grid */}
      <div className="card-academic p-4 overflow-x-auto bg-white border border-neutral">
        <table className="w-full border-collapse text-xs select-none min-w-[900px]">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary">
              <th className="p-2.5 text-left font-normal w-24">Time Slot</th>
              {daysOfWeek.map((day) => {
                const isWeekend = day === 'Saturday' || day === 'Sunday';
                return (
                  <th key={day} className={`p-2.5 text-center font-normal border-l border-neutral ${isWeekend ? 'bg-muted/70 text-secondary/50' : 'text-secondary'}`}>
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {timeSlots.map((slot, periodIdx) => (
              <tr key={slot} className="hover:bg-muted/20 transition-colors">
                <td className="p-2 font-mono text-[11px] text-secondary font-medium whitespace-nowrap bg-muted/30">
                  {slot}
                </td>
                {daysOfWeek.map((day) => {
                  const isWeekend = day === 'Saturday' || day === 'Sunday';
                  const entry = myTimetable.find((t) => t.day.toLowerCase() === day.toLowerCase() && t.periodIndex === periodIdx);

                  return (
                    <td
                      key={day}
                      onClick={() => openCellModal(day, periodIdx)}
                      className={`p-1.5 border-l border-neutral cursor-pointer transition-colors h-14 align-top ${isWeekend ? 'bg-neutral/10' : 'hover:bg-primary/5'} ${entry ? 'bg-muted/40' : ''}`}>
                      {entry ? (
                        <div
                          style={{ borderLeftColor: entry.color || '#640000' }}
                          className="h-full p-1.5 border-l-2 bg-surface border border-neutral shadow-xs flex flex-col justify-between">
                          <div className="font-bold text-[11px] text-primary leading-tight line-clamp-1">{entry.subject}</div>
                          <div className="label-sm text-[10px] text-secondary/70 truncate">{entry.roomName}</div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 text-secondary/30">
                          <Plus size={14} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4 Widgets Below Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Widget 1: Notes */}
        <div className="card-academic p-4 flex flex-col justify-between bg-white border border-neutral">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral mb-3">
              <h3 className="title-md text-secondary font-normal text-sm">Notes</h3>
              <button onClick={() => setActiveNoteModal({ title: '', content: '' })} className="btn-tertiary text-xs p-1">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {myNotes.length === 0 ? (
                <div className="text-xs text-secondary/50 py-4 text-center">No notes yet. Click + to add.</div>
              ) : (
                myNotes.map((n) => (
                  <div key={n.id} onClick={() => setActiveNoteModal(n)} className="p-2 border border-neutral bg-muted/30 cursor-pointer hover:border-primary transition-colors text-xs">
                    <div className="font-medium text-secondary truncate">{n.title}</div>
                    <div className="text-[11px] text-secondary/70 line-clamp-1 mt-0.5">{n.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={() => setActiveNoteModal({ title: '', content: '' })} className="btn-secondary w-full justify-center text-xs mt-3">
            + New Note
          </button>
        </div>

        {/* Widget 2: My Tasks */}
        <div className="card-academic p-4 flex flex-col justify-between bg-white border border-neutral">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral mb-3">
              <h3 className="title-md text-secondary font-normal text-sm">My Tasks</h3>
              <button onClick={() => setActiveTaskModal(true)} className="btn-tertiary text-xs p-1">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {myTasks.length === 0 || myTasks.every((t) => t.is_done) ? (
                <div className="text-xs text-secondary/70 py-6 text-center">
                  <div className="text-lg mb-1">✅</div>
                  All tasks completed ✅
                </div>
              ) : (
                myTasks.map((t) => (
                  <div key={t.id} className="flex items-start gap-2 p-1.5 border border-neutral bg-muted/20 text-xs">
                    <button
                      onClick={() => setTasks((p) => p.map((x) => x.id === t.id ? { ...x, is_done: !x.is_done } : x))}
                      className="bg-transparent border-none p-0 cursor-pointer text-secondary">
                      {t.is_done ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                    </button>
                    <span className={`line-clamp-1 ${t.is_done ? 'line-through text-secondary/40' : 'text-secondary'}`}>{t.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={() => setActiveTaskModal(true)} className="btn-secondary w-full justify-center text-xs mt-3">
            + Add Task
          </button>
        </div>

        {/* Widget 3: Links */}
        <div className="card-academic p-4 flex flex-col justify-between bg-white border border-neutral">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral mb-3">
              <h3 className="title-md text-secondary font-normal text-sm">Academic Links</h3>
              <button onClick={() => setActiveLinkModal(true)} className="btn-tertiary text-xs p-1">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {myLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-neutral bg-muted/20 hover:border-primary transition-colors flex items-center justify-between text-xs text-secondary no-underline">
                  <span className="truncate">{l.title}</span>
                  <ExternalLink size={12} className="text-primary shrink-0" />
                </a>
              ))}
            </div>
          </div>
          <button onClick={() => setActiveLinkModal(true)} className="btn-secondary w-full justify-center text-xs mt-3">
            + Add Link
          </button>
        </div>

        {/* Widget 4: Files (Storage meter 20 MB used) */}
        <div className="card-academic p-4 flex flex-col justify-between bg-white border border-neutral">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral mb-2">
              <h3 className="title-md text-secondary font-normal text-sm">Course Files</h3>
              <button onClick={() => fileInputRef.current?.click()} className="btn-tertiary text-xs p-1">
                <Plus size={16} />
              </button>
            </div>

            {/* Storage Meter */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-secondary mb-1">
                <span>Storage Quota</span>
                <span className="font-bold text-primary">{quota.usedMB.toFixed(2)} MB / 20.00 MB used</span>
              </div>
              <div className="w-full bg-neutral h-2 overflow-hidden">
                <div
                  style={{ width: `${quota.percentage}%` }}
                  className={`h-full transition-all ${quota.percentage > 85 ? 'bg-red-600' : 'bg-primary'}`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {myFiles.map((f) => (
                <div key={f.id} className="p-1.5 border border-neutral bg-muted/20 flex items-center justify-between text-xs">
                  <div className="truncate flex-1">
                    <div className="text-secondary truncate">{f.name}</div>
                    <div className="text-[10px] text-secondary/60">{f.size} MB</div>
                  </div>
                  <button
                    onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                    className="p-1 text-secondary/60 hover:text-red-700 bg-transparent border-none cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full justify-center text-xs mt-3 flex items-center gap-1.5">
              <Upload size={13} /> Upload File (Max 10 MB)
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Edit Cell Block */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingCell(null)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral">
              <div>
                <span className="chip-academic-maroon text-[10px] uppercase">{editingCell.day}</span>
                <h3 className="title-md text-primary mt-1">Class Block ({timeSlots[editingCell.periodIndex]})</h3>
              </div>
              <button onClick={() => setEditingCell(null)} className="p-1 text-secondary bg-transparent border-none cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="flex flex-col gap-3">
              <div>
                <label className="label-sm text-secondary block mb-1">Subject / Course Name</label>
                <input
                  type="text"
                  value={cellSubject}
                  onChange={(e) => setCellSubject(e.target.value)}
                  placeholder="e.g. UCS405: Operating Systems"
                  className="input-academic w-full"
                  required
                />
              </div>

              <div>
                <label className="label-sm text-secondary block mb-1">Classroom / Laboratory</label>
                <select
                  value={cellRoom}
                  onChange={(e) => setCellRoom(e.target.value)}
                  className="input-academic w-full">
                  {classrooms.map((c) => (
                    <option key={c.id} value={`${c.name} (${c.code})`}>
                      {c.name} ({c.block})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-sm text-secondary block mb-1">Assigned Professor</label>
                <select
                  value={cellProf}
                  onChange={(e) => setCellProf(e.target.value)}
                  className="input-academic w-full">
                  {professors.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.profile?.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-sm text-secondary block mb-1">Card Accent Color</label>
                <div className="flex items-center gap-3">
                  {['#640000', '#313131', '#1e3a8a', '#065f46'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCellColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 border-2 cursor-pointer ${cellColor === color ? 'border-secondary ring-2 ring-primary/40' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral mt-2">
                {editingCell.existing ? (
                  <button type="button" onClick={handleDeleteCell} className="btn-secondary text-xs text-red-700 border-red-200">
                    Delete Block
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingCell(null)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Save Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Official Timetable */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsImportModalOpen(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-lg border border-neutral p-6 shadow-xl z-10 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral">
              <h3 className="title-md text-primary">Import Official Timetable</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 text-secondary bg-transparent border-none cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="body-sm text-secondary">
              Paste CSV records formatted as: <br />
              <code className="text-primary bg-muted p-1 text-[11px]">Day, PeriodIndex (0-12), Subject, Room, Professor</code>
            </p>
            <textarea
              rows={6}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder="Monday, 1, UCS405: Operating Systems, LT 101, Dr. Rajesh Kumar&#10;Monday, 3, UCS414: Computer Networks, LP 104, Dr. Sunita Bansal&#10;Tuesday, 2, UCS310: Database Systems, LT 102, Dr. Amanpreet Kaur"
              className="input-academic w-full font-mono text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsImportModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleImportTimetable} className="btn-primary text-xs">Parse & Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Note */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveNoteModal(null)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Academic Note</h3>
            <input
              type="text"
              value={activeNoteModal.title}
              onChange={(e) => setActiveNoteModal({ ...activeNoteModal, title: e.target.value })}
              placeholder="Note Title"
              className="input-academic w-full"
            />
            <textarea
              rows={4}
              value={activeNoteModal.content}
              onChange={(e) => setActiveNoteModal({ ...activeNoteModal, content: e.target.value })}
              placeholder="Note contents..."
              className="input-academic w-full"
            />
            <div className="flex justify-between pt-2">
              {activeNoteModal.id && (
                <button
                  onClick={() => { setNotes((p) => p.filter((x) => x.id !== activeNoteModal.id)); setActiveNoteModal(null); }}
                  className="btn-secondary text-xs text-red-700">
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setActiveNoteModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button
                  onClick={() => {
                    if (activeNoteModal.id) {
                      setNotes((p) => p.map((x) => x.id === activeNoteModal.id ? activeNoteModal : x));
                    } else {
                      setNotes((p) => [{ id: `note-${Date.now()}`, ownerId, ...activeNoteModal }, ...p]);
                    }
                    setActiveNoteModal(null);
                  }}
                  className="btn-primary text-xs">
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveTaskModal(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Add Coursework Task</h3>
            <input
              type="text"
              id="new-task-label"
              placeholder="Task description (e.g. Finish OS Lab 3)"
              className="input-academic w-full"
            />
            <input
              type="text"
              id="new-task-sub"
              placeholder="Subtext / Due Date (e.g. Due Friday 11:59 PM)"
              className="input-academic w-full"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveTaskModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button
                onClick={() => {
                  const label = document.getElementById('new-task-label').value;
                  const sub = document.getElementById('new-task-sub').value;
                  if (label) {
                    setTasks((p) => [{ id: `tsk-${Date.now()}`, ownerId, label, sub: sub || 'Coursework', is_done: false }, ...p]);
                    setActiveTaskModal(false);
                  }
                }}
                className="btn-primary text-xs">
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Link */}
      {activeLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveLinkModal(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Add Academic Link</h3>
            <input type="text" id="link-title" placeholder="Resource Title (e.g. Library Portal)" className="input-academic w-full" />
            <input type="text" id="link-url" placeholder="URL (e.g. https://library.thapar.edu)" className="input-academic w-full" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveLinkModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button
                onClick={() => {
                  const title = document.getElementById('link-title').value;
                  let url = document.getElementById('link-url').value;
                  if (title && url) {
                    if (!url.startsWith('http')) url = `https://${url}`;
                    setLinks((p) => [{ id: `link-${Date.now()}`, ownerId, title, url }, ...p]);
                    setActiveLinkModal(false);
                  }
                }}
                className="btn-primary text-xs">
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. CALENDAR PAGE
// ==========================================
function CalendarPage() {
  const { user, timetables, tasks, meetingRequests } = useApp();
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'day'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'classes' | 'tasks' | 'meetings'

  const ownerId = user?.id || 'usr_student_demo';

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">Academic Calendar</h1>
          <p className="body-md text-secondary mt-0.5">Classes, coursework deadlines, and confirmed meetings.</p>
        </div>

        {/* View Switcher: Month / Week / Day */}
        <div className="flex items-center gap-2">
          <div className="flex border border-neutral">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3 py-1.5 text-xs uppercase border-none cursor-pointer ${calendarView === v ? 'bg-primary text-white font-medium' : 'bg-surface text-secondary'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'classes', 'tasks', 'meetings'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1 text-xs border border-neutral capitalize cursor-pointer ${filterType === f ? 'bg-secondary text-white' : 'bg-surface text-secondary hover:bg-neutral/40'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Calendar Grid Representation */}
      <div className="card-academic p-5 bg-white border border-neutral">
        <div className="grid grid-cols-7 gap-2 text-center text-xs pb-3 border-b border-neutral font-medium text-secondary">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-2 mt-3 text-xs">
          {Array.from({ length: 28 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === 13;
            return (
              <div
                key={idx}
                className={`min-h-[90px] p-2 border border-neutral flex flex-col justify-between ${isToday ? 'bg-primary/5 border-primary font-bold' : 'bg-surface'}`}>
                <div className="flex justify-between items-center text-[11px] text-secondary">
                  <span>{dayNum}</span>
                  {isToday && <span className="text-[9px] text-primary uppercase font-bold">Today</span>}
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  {dayNum === 16 && (filterType === 'all' || filterType === 'meetings') && (
                    <div className="p-1 bg-primary text-white text-[9px] truncate">
                      3:30 PM • Meeting with Dr. Rajesh
                    </div>
                  )}
                  {dayNum === 14 && (filterType === 'all' || filterType === 'tasks') && (
                    <div className="p-1 bg-amber-100 text-amber-900 text-[9px] truncate">
                      Due: OS Assign 3
                    </div>
                  )}
                  {dayNum === 17 && (filterType === 'all' || filterType === 'meetings') && (
                    <div className="p-1 bg-emerald-100 text-emerald-900 text-[9px] truncate">
                      11:20 AM • Dr. Sunita
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. PROFESSOR DIRECTORY & MEETING SCHEDULER
// ==========================================
function ProfessorsDirectory() {
  const { professors, classrooms, timetables, checkSlotConflict, meetingRequests, setMeetingRequests, addNotification, addAuditLog, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [sortOption, setSortOption] = useState('az');

  // Modals
  const [selectedProfile, setSelectedProfile] = useState(null); // Professor detail modal
  const [bookingProf, setBookingProf] = useState(null); // Meeting request modal

  // Form states for booking
  const [reqDate, setReqDate] = useState('2026-11-16');
  const [reqSlot, setReqSlot] = useState(timeSlots[0]);
  const [reqReason, setReqReason] = useState('');
  const [reqType, setReqType] = useState('Doubt');
  const [attachedFile, setAttachedFile] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);

  const departments = ['All', 'CSED', 'Physics', 'Mathematics', 'Electronics', 'Mechanical'];

  // Filter & sort
  const filteredProfessors = useMemo(() => {
    return professors
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const codeMatch = p.profile?.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const deptMatch = selectedDept === 'All' || p.profile?.department === selectedDept;
        return (nameMatch || codeMatch) && deptMatch;
      })
      .sort((a, b) => {
        if (sortOption === 'az') return a.name.localeCompare(b.name);
        if (sortOption === 'dept') return (a.profile?.department || '').localeCompare(b.profile?.department || '');
        return 0;
      });
  }, [professors, searchTerm, selectedDept, sortOption]);

  // Live conflict evaluation whenever date or slot changes
  useEffect(() => {
    if (bookingProf && reqDate && reqSlot) {
      const conflict = checkSlotConflict(bookingProf.id, user?.id, reqDate, reqSlot);
      setConflictWarning(conflict.hasConflict ? conflict.reason : null);
    }
  }, [bookingProf, reqDate, reqSlot, user, checkSlotConflict]);

  const handleOpenBooking = (prof) => {
    setBookingProf(prof);
    setReqDate('2026-11-16');
    setReqSlot(timeSlots[0]);
    setReqReason('');
    setReqType('Doubt');
    setAttachedFile(null);
  };

  const handleSubmitMeetingRequest = (e) => {
    e.preventDefault();
    if (!reqReason.trim()) {
      alert('Please provide a reason for the consultation.');
      return;
    }

    if (conflictWarning) {
      if (!confirm(`Warning: There is a slot conflict:\n"${conflictWarning}"\nDo you still wish to submit as pending?`)) {
        return;
      }
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      studentId: user?.id || 'usr_student_demo',
      studentName: user?.name || 'Sumit Bansal',
      studentRoll: user?.profile?.rollNo || '102303492',
      studentBranch: user?.profile?.branch || 'Computer Science',
      professorId: bookingProf.id,
      professorName: bookingProf.name,
      date: reqDate,
      timeSlot: reqSlot,
      reason: reqReason,
      type: reqType,
      attachmentUrl: attachedFile ? URL.createObjectURL(attachedFile) : null,
      attachmentName: attachedFile ? attachedFile.name : null,
      attachmentSize: attachedFile ? Math.round((attachedFile.size / (1024 * 1024)) * 100) / 100 : 0,
      status: 'pending',
      professorRemark: null,
      createdAt: new Date().toISOString()
    };

    setMeetingRequests((p) => [newRequest, ...p]);

    // Send notifications
    addNotification(
      bookingProf.id,
      'New Meeting Request',
      `${user?.name || 'Student'} requested a consultation on ${reqDate} (${reqSlot}) regarding "${reqReason.slice(0, 40)}...".`,
      '/requests'
    );

    addAuditLog('REQUEST_SUBMITTED', user?.name, 'student', `Submitted consultation request with ${bookingProf.name} for ${reqDate} (${reqSlot})`);

    alert('Meeting request submitted successfully! Professor will review your request.');
    setBookingProf(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Title & Subtitle */}
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Faculty Directory</h1>
        <p className="body-md text-secondary mt-0.5">Discover and connect with your professors</p>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by professor name or teacher code..."
              className="input-academic w-full pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="label-sm text-secondary/70 whitespace-nowrap">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input-academic text-xs">
              <option value="az">Name (A-Z)</option>
              <option value="dept">Department</option>
            </select>
          </div>
        </div>

        {/* Department Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 text-xs border border-neutral transition-colors cursor-pointer ${selectedDept === dept ? 'bg-primary text-white font-medium border-primary' : 'bg-surface text-secondary hover:bg-neutral/40'}`}>
              {dept === 'All' ? 'All Depts' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProfessors.map((prof) => (
          <div
            key={prof.id}
            className="card-academic p-5 flex flex-col justify-between bg-white border border-neutral hover:border-primary transition-all">
            <div>
              {/* Avatar with Online Dot */}
              <div className="relative w-16 h-16 mb-3">
                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="w-full h-full object-cover rounded-none border border-neutral"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white" title="Online / Available on campus" />
              </div>

              {/* Designation Badge */}
              <span className="chip-academic-maroon text-[9px] uppercase font-bold">
                {prof.profile?.designation || 'PROFESSOR'}
              </span>

              {/* Name & Department */}
              <h3 className="title-md text-secondary font-normal mt-2 leading-snug">
                {prof.name}
              </h3>
              <div className="body-sm text-primary font-medium mt-0.5">
                {prof.profile?.department}
              </div>

              {/* LOCATION and CODE */}
              <div className="mt-4 pt-3 border-t border-neutral text-[11px] space-y-1 text-secondary/80">
                <div>
                  <span className="text-secondary/50 uppercase text-[10px] block">Location</span>
                  <span className="truncate block">{prof.profile?.officeLocation}</span>
                </div>
                <div>
                  <span className="text-secondary/50 uppercase text-[10px] block">Teacher Code</span>
                  <span className="font-mono font-bold text-primary">{prof.profile?.teacherCode}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => setSelectedProfile(prof)}
                className="btn-secondary w-full justify-center text-xs">
                View Full Profile →
              </button>
              <button
                onClick={() => handleOpenBooking(prof)}
                className="btn-primary w-full justify-center text-xs">
                Request Meeting
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Professor Full Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedProfile(null)} className="fixed inset-0 bg-secondary/60" />
          <div className="relative bg-surface w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-neutral p-6 sm:p-8 shadow-xl z-10 flex flex-col gap-6">
            <div className="flex justify-between items-start pb-4 border-b border-neutral">
              <div className="flex gap-4 items-center">
                <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-16 h-16 object-cover border border-neutral" />
                <div>
                  <span className="chip-academic-maroon text-[10px] uppercase font-bold">{selectedProfile.profile?.designation}</span>
                  <h2 className="headline-sm text-primary mt-1">{selectedProfile.name}</h2>
                  <div className="label-sm text-secondary/70">{selectedProfile.profile?.department} • Code: {selectedProfile.profile?.teacherCode}</div>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="p-1 text-secondary bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted border border-neutral text-xs">
              <div><span className="text-secondary/50 text-[10px] uppercase block">Office Location</span><strong>{selectedProfile.profile?.officeLocation}</strong></div>
              <div><span className="text-secondary/50 text-[10px] uppercase block">Official Email</span><strong>{selectedProfile.email}</strong></div>
              <div><span className="text-secondary/50 text-[10px] uppercase block">Office Consultation Hours</span><strong className="text-primary">{selectedProfile.profile?.officeHours}</strong></div>
            </div>

            <div>
              <h4 className="title-md text-secondary font-normal mb-1">Biography & Research Areas</h4>
              <p className="body-sm text-secondary leading-relaxed bg-muted/30 p-3 border border-neutral">
                {selectedProfile.profile?.bio}
              </p>
              <div className="mt-2 text-xs text-primary font-medium">
                Core Research: {selectedProfile.profile?.research}
              </div>
            </div>

            {/* Professor Weekly Timetable */}
            <div>
              <h4 className="title-md text-secondary font-normal mb-2">Professor Weekly Timetable & Busy Slots</h4>
              <div className="text-xs text-secondary/70 mb-2">Dark blocks show teaching lectures. Highlighted slots prevent double bookings.</div>
              <div className="border border-neutral overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted border-b border-neutral text-secondary">
                      <th className="p-2 font-normal">Day</th>
                      <th className="p-2 font-normal">Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral">
                    {daysOfWeek.slice(0, 5).map((d) => {
                      const profSlots = timetables.filter((t) => t.ownerId === selectedProfile.id && t.day.toLowerCase() === d.toLowerCase());
                      return (
                        <tr key={d}>
                          <td className="p-2 font-medium text-secondary whitespace-nowrap bg-muted/20 w-24">{d}</td>
                          <td className="p-2">
                            {profSlots.length === 0 ? (
                              <span className="text-emerald-700 font-medium">Free for student consultations</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {profSlots.map((ps) => (
                                  <span key={ps.id} className="px-2 py-0.5 bg-primary text-white text-[10px]">
                                    {ps.timeSlot}: {ps.subject}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral flex justify-between items-center">
              <button onClick={() => setSelectedProfile(null)} className="btn-secondary text-xs">Close</button>
              <button
                onClick={() => { const p = selectedProfile; setSelectedProfile(null); handleOpenBooking(p); }}
                className="btn-primary text-xs">
                Request Meeting with {selectedProfile.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Request Form Modal (Core Feature) */}
      {bookingProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setBookingProf(null)} className="fixed inset-0 bg-secondary/60" />
          <div className="relative bg-surface w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral p-6 sm:p-8 shadow-xl z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start pb-3 border-b border-neutral">
              <div>
                <span className="chip-academic-maroon text-[10px] uppercase">Consultation Booking</span>
                <h2 className="headline-sm text-primary mt-1">Schedule with {bookingProf.name}</h2>
                <div className="label-sm text-secondary/70">{bookingProf.profile?.officeLocation} • {bookingProf.profile?.officeHours}</div>
              </div>
              <button onClick={() => setBookingProf(null)} className="p-1 text-secondary bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitMeetingRequest} className="flex flex-col gap-4">
              {/* Date & Slot selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-sm text-secondary block mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="input-academic w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-sm text-secondary block mb-1">Time Slot (13 Periods)</label>
                  <select
                    value={reqSlot}
                    onChange={(e) => setReqSlot(e.target.value)}
                    className="input-academic w-full">
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slot Conflict Alert Banner */}
              {conflictWarning && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Schedule Conflict Detected:</div>
                    <div>{conflictWarning}</div>
                  </div>
                </div>
              )}

              {/* Meeting Type */}
              <div>
                <label className="label-sm text-secondary block mb-1">Meeting Category</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="input-academic w-full">
                  <option value="Doubt">Doubt Clearance / Coursework</option>
                  <option value="Project discussion">Project Discussion / Capstone</option>
                  <option value="Guidance">Research & Guidance</option>
                  <option value="Other">Other Academic Concern</option>
                </select>
              </div>

              {/* Reason for Meeting */}
              <div>
                <label className="label-sm text-secondary block mb-1">
                  Reason for Meeting <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Detail the topics or questions you wish to consult on..."
                  className="input-academic w-full"
                  required
                />
              </div>

              {/* Optional Project Idea Document Upload (Max 10 MB) */}
              <div>
                <label className="label-sm text-secondary block mb-1">
                  Attach Project Idea / Synopsis (Optional PDF/DOC/PPT, max 10 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                  className="input-academic w-full text-xs"
                />
                {attachedFile && (
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Attached: {attachedFile.name} ({(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral mt-2">
                <button type="button" onClick={() => setBookingProf(null)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Submit Meeting Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. MY REQUESTS & FACULTY REQUESTS DESK
// ==========================================
function RequestsPage() {
  const { user, meetingRequests, setMeetingRequests, addNotification, addAuditLog } = useApp();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'cancelled'
  const [rejectingReq, setRejectingReq] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [reschedulingReq, setReschedulingReq] = useState(null);
  const [newReschedSlot, setNewReschedSlot] = useState(timeSlots[0]);
  const [newReschedDate, setNewReschedDate] = useState('2026-11-17');

  const isProfessor = user?.role === 'professor';

  // Filter requests
  const userRequests = useMemo(() => {
    return meetingRequests.filter((r) => {
      const matchRole = isProfessor ? r.professorId === user?.id : r.studentId === user?.id;
      const matchTab = activeTab === 'all' || r.status.toLowerCase() === activeTab.toLowerCase();
      return matchRole && matchTab;
    });
  }, [meetingRequests, user, isProfessor, activeTab]);

  const acceptedCount = meetingRequests.filter((r) => (isProfessor ? r.professorId === user?.id : r.studentId === user?.id) && r.status === 'accepted').length;
  const pendingCount = meetingRequests.filter((r) => (isProfessor ? r.professorId === user?.id : r.studentId === user?.id) && r.status === 'pending').length;

  // Actions
  const handleAccept = (req) => {
    setMeetingRequests((p) => p.map((r) => r.id === req.id ? { ...r, status: 'accepted', professorRemark: 'Accepted by professor.' } : r));
    addNotification(req.studentId, 'Meeting Confirmed', `${req.professorName} accepted your consultation request for ${req.date} at ${req.timeSlot}.`, '/requests');
    addAuditLog('REQUEST_ACCEPTED', req.professorName, 'professor', `Approved request #${req.id} from student ${req.studentName}`);
  };

  const handleConfirmReject = () => {
    if (!rejectingReq) return;
    setMeetingRequests((p) => p.map((r) => r.id === rejectingReq.id ? { ...r, status: 'rejected', professorRemark: rejectRemark || 'Declined by professor' } : r));
    addNotification(rejectingReq.studentId, 'Meeting Declined', `${rejectingReq.professorName} declined your meeting request. Reason: ${rejectRemark || 'Not available'}`, '/requests');
    addAuditLog('REQUEST_REJECTED', rejectingReq.professorName, 'professor', `Declined request #${rejectingReq.id} with remark: ${rejectRemark}`);
    setRejectingReq(null);
    setRejectRemark('');
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingReq) return;
    setMeetingRequests((p) => p.map((r) => r.id === reschedulingReq.id ? {
      ...r,
      status: 'pending',
      date: newReschedDate,
      timeSlot: newReschedSlot,
      professorRemark: `Proposed new time: ${newReschedDate} at ${newReschedSlot}`
    } : r));
    addNotification(reschedulingReq.studentId, 'Time Rescheduled', `${reschedulingReq.professorName} proposed an alternate time on ${newReschedDate} (${newReschedSlot}).`, '/requests');
    setReschedulingReq(null);
  };

  const handleCancelRequest = (req) => {
    if (confirm('Are you sure you want to cancel this consultation request?')) {
      setMeetingRequests((p) => p.map((r) => r.id === req.id ? { ...r, status: 'cancelled' } : r));
      addAuditLog('REQUEST_CANCELLED', user?.name, user?.role, `Cancelled request #${req.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Card "My Requests" with count summary */}
      <div className="card-academic p-6 bg-white border border-neutral flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="chip-academic-maroon text-[10px] uppercase">Consultation Hub</span>
          <h1 className="headline-lg text-primary mt-1">
            {isProfessor ? 'Student Meeting Requests Desk' : 'My Requests'}
          </h1>
          <p className="body-md text-secondary mt-0.5">
            {acceptedCount} accepted • {pendingCount} pending review
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 border border-neutral p-1 bg-muted/40">
          {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs uppercase border-none cursor-pointer transition-colors ${activeTab === tab ? 'bg-primary text-white font-medium' : 'bg-transparent text-secondary hover:bg-neutral/40'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-4">
        {userRequests.length === 0 ? (
          /* Empty State */
          <div className="card-academic p-12 text-center bg-white border border-neutral">
            <div className="text-3xl mb-2">📫</div>
            <h3 className="title-md text-secondary font-normal">No consultation requests found.</h3>
            <p className="body-sm text-secondary/60 mt-1 max-w-md mx-auto">
              {isProfessor
                ? 'No pending student requests matching this category.'
                : 'You have not booked any appointments with faculty yet. Browse the Faculty Directory to schedule a consultation.'}
            </p>
          </div>
        ) : (
          userRequests.map((req) => (
            <div
              key={req.id}
              className="card-academic p-5 bg-white border border-neutral flex flex-col justify-between gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="title-md text-secondary font-normal">{req.reason}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : req.status === 'rejected' ? 'bg-red-100 text-red-800' : req.status === 'cancelled' ? 'bg-neutral text-secondary' : 'bg-amber-100 text-amber-800'}`}>
                      {req.status}
                    </span>
                    <span className="chip-academic text-[10px]">{req.type}</span>
                  </div>

                  <div className="body-sm text-secondary mt-1.5 flex flex-wrap gap-4">
                    <span>
                      {isProfessor ? 'Student' : 'Faculty'}: <strong className="text-primary">{isProfessor ? req.studentName : req.professorName}</strong>
                    </span>
                    {req.studentRoll && (
                      <span className="text-secondary/70">Roll: {req.studentRoll}</span>
                    )}
                    <span className="font-medium text-secondary">
                      📅 {req.date} ({req.timeSlot})
                    </span>
                  </div>

                  {req.professorRemark && (
                    <div className="mt-2 text-xs bg-muted p-2 border-l-2 border-primary text-secondary">
                      <strong>Remark:</strong> {req.professorRemark}
                    </div>
                  )}

                  {req.attachmentName && (
                    <div className="mt-2 text-xs flex items-center gap-1.5 text-primary">
                      <FileText size={14} />
                      <a href={req.attachmentUrl || '#'} download className="underline hover:text-secondary">
                        {req.attachmentName} ({req.attachmentSize} MB)
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Professor Actions */}
                  {isProfessor && req.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(req)} className="btn-primary text-xs">
                        Accept (Lock Slot)
                      </button>
                      <button onClick={() => setReschedulingReq(req)} className="btn-secondary text-xs">
                        Suggest New Time
                      </button>
                      <button onClick={() => setRejectingReq(req)} className="btn-secondary text-xs text-red-700">
                        Reject with Remark
                      </button>
                    </>
                  )}

                  {/* Student Actions */}
                  {!isProfessor && req.status === 'pending' && (
                    <>
                      <button onClick={() => setReschedulingReq(req)} className="btn-secondary text-xs">
                        Reschedule
                      </button>
                      <button onClick={() => handleCancelRequest(req)} className="btn-secondary text-xs text-red-700">
                        Cancel Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Reject with Remark */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRejectingReq(null)} className="fixed inset-0 bg-secondary/60" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-red-700">Decline Meeting Request</h3>
            <p className="body-sm text-secondary">Provide feedback or advice for {rejectingReq.studentName}:</p>
            <textarea
              rows={3}
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="e.g. Please join group doubt counter on Friday at 3 PM..."
              className="input-academic w-full"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectingReq(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleConfirmReject} className="btn-primary text-xs bg-red-700">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reschedule / Propose New Time */}
      {reschedulingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReschedulingReq(null)} className="fixed inset-0 bg-secondary/60" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Propose Alternate Time</h3>
            <div>
              <label className="label-sm text-secondary block mb-1">Select New Date</label>
              <input
                type="date"
                value={newReschedDate}
                onChange={(e) => setNewReschedDate(e.target.value)}
                className="input-academic w-full"
              />
            </div>
            <div>
              <label className="label-sm text-secondary block mb-1">Select Alternate Period</label>
              <select
                value={newReschedSlot}
                onChange={(e) => setNewReschedSlot(e.target.value)}
                className="input-academic w-full">
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setReschedulingReq(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleConfirmReschedule} className="btn-primary text-xs">Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 10. PROFESSOR PORTAL: DASHBOARD & STUDENTS
// ==========================================
function FacultyDashboard() {
  const { user, timetables, meetingRequests } = useApp();
  const [scheduleToggle, setScheduleToggle] = useState('day');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDayName = daysOfWeek[currentTime.getDay() === 0 ? 6 : currentTime.getDay() - 1];

  const profClassesToday = timetables
    .filter((t) => t.ownerId === (user?.id || 'usr_prof_demo') && t.day.toLowerCase() === currentDayName.toLowerCase())
    .sort((a, b) => a.periodIndex - b.periodIndex);

  const pendingRequests = meetingRequests.filter((r) => r.professorId === (user?.id || 'usr_prof_demo') && r.status === 'pending');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">
            Faculty Portal: {user?.name || 'Dr. Rajesh Kumar'} 🎓
          </h1>
          <p className="body-md text-secondary mt-0.5">Faculty Academic Consultation Desk & Schedule Management</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-muted border border-neutral text-xs font-normal text-secondary">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="px-3 py-1.5 bg-surface border border-primary text-xs font-mono font-bold text-primary flex items-center gap-1.5">
            <Clock size={13} className="text-primary animate-pulse" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Grid: Next Lecture & Pending Requests Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-academic p-6 flex flex-col justify-between border-l-4 border-l-primary bg-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="chip-academic-maroon text-[10px] uppercase">Next Scheduled Session</span>
              <span className="label-sm text-secondary/70">Teaching Schedule</span>
            </div>

            {profClassesToday.length > 0 ? (
              <div className="mt-4">
                <h3 className="headline-sm text-secondary font-light">{profClassesToday[0].subject}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
                  <span className="font-bold text-primary">{profClassesToday[0].timeSlot}</span>
                  <span>Venue: {profClassesToday[0].roomName || 'LT 101'}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 py-4 text-center text-secondary/60 body-sm">
                No teaching lectures scheduled for today. You are free for research & office hours.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral flex justify-between items-center">
            <span className="label-sm text-secondary/70">Academic Faculty Wing</span>
            <button onClick={() => navigate('/workspace')} className="btn-secondary text-xs">
              Manage Faculty Timetable →
            </button>
          </div>
        </div>

        {/* Pending Requests Desk */}
        <div className="card-academic p-5 bg-white flex flex-col justify-between border border-neutral">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="title-md text-secondary font-normal">Pending Desk</h2>
              <span className="chip-academic-maroon text-[10px]">{pendingRequests.length} Pending</span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-secondary/60 body-sm">
                No pending consultation requests.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {pendingRequests.map((r) => (
                  <div key={r.id} className="p-2.5 border border-neutral bg-muted/30 text-xs">
                    <div className="font-bold text-primary">{r.studentName}</div>
                    <div className="text-secondary/80 truncate mt-0.5">{r.reason}</div>
                    <div className="label-sm text-secondary/60 mt-1">{r.date} ({r.timeSlot})</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/requests')} className="btn-primary w-full justify-center text-xs mt-3">
            Open Meeting Requests Desk
          </button>
        </div>
      </div>
    </div>
  );
}

// Students Roster for Professor
function StudentsDirectory() {
  const { students, meetingRequests } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.profile?.rollNo?.includes(searchTerm));

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Enrolled Students Roster</h1>
        <p className="body-md text-secondary mt-0.5">Undergraduate & postgraduate candidates registered in your departments</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by student name or roll number..."
          className="input-academic w-full pl-9"
        />
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Roll Number</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Department & Batch</th>
              <th className="p-3">Total Consultations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {filtered.map((s) => {
              const count = meetingRequests.filter((r) => r.studentId === s.id).length;
              return (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="p-3 font-mono font-bold text-primary">{s.profile?.rollNo || '102303492'}</td>
                  <td className="p-3 font-medium text-secondary">{s.name}</td>
                  <td className="p-3 text-secondary/70">{s.profile?.branch || 'Computer Science'} ({s.profile?.year})</td>
                  <td className="p-3 font-bold text-secondary">{count} recorded</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 11. ADMIN PORTAL (DASHBOARD & MANAGEMENT)
// ==========================================
function AdminDashboard() {
  const { students, professors, classrooms, meetingRequests, auditLogs } = useApp();
  const navigate = useNavigate();

  const totalFilesMB = 6.4; // sample calculation

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Academic Administration Dashboard</h1>
        <p className="body-md text-secondary mt-0.5">Central system control, analytics & audit trail</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-academic p-4 border border-neutral bg-white">
          <div className="label-sm text-secondary/60 uppercase">Total Students</div>
          <div className="headline-sm text-primary mt-1">{students.length}</div>
        </div>
        <div className="card-academic p-4 border border-neutral bg-white">
          <div className="label-sm text-secondary/60 uppercase">Professors</div>
          <div className="headline-sm text-secondary mt-1">{professors.length}</div>
        </div>
        <div className="card-academic p-4 border border-neutral bg-white">
          <div className="label-sm text-secondary/60 uppercase">Classrooms & Labs</div>
          <div className="headline-sm text-secondary mt-1">{classrooms.length}</div>
        </div>
        <div className="card-academic p-4 border border-neutral bg-white">
          <div className="label-sm text-secondary/60 uppercase">Consultations</div>
          <div className="headline-sm text-primary mt-1">{meetingRequests.length}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-academic p-5 bg-white border border-neutral">
        <h3 className="title-md text-secondary font-normal mb-3">Administrative Shortcuts</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/admin/students')} className="btn-secondary text-xs">
            Manage Students
          </button>
          <button onClick={() => navigate('/admin/professors')} className="btn-secondary text-xs">
            Manage Professors
          </button>
          <button onClick={() => navigate('/admin/classrooms')} className="btn-secondary text-xs">
            Manage Classrooms
          </button>
          <button onClick={() => navigate('/admin/audit-log')} className="btn-primary text-xs">
            Inspect Audit Logs
          </button>
        </div>
      </div>

      {/* Live System Audit Stream */}
      <div className="card-academic p-5 bg-white border border-neutral">
        <h3 className="title-md text-secondary font-normal mb-3">Live System Activity Stream</h3>
        <div className="divide-y divide-neutral max-h-80 overflow-y-auto">
          {auditLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="py-2.5 text-xs flex justify-between items-start gap-4">
              <div>
                <span className="font-bold text-primary uppercase text-[10px]">{log.action}</span>
                <span className="text-secondary ml-2">{log.details}</span>
              </div>
              <span className="text-secondary/50 text-[10px] whitespace-nowrap">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin: Manage Students
function AdminStudentsPage() {
  const { students, setStudents, addAuditLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNo: '',
    branch: 'Computer Science & Engineering',
    year: '3rd Year'
  });

  const filtered = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.profile?.rollNo?.includes(searchTerm));

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      id: `usr_s_${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      profile: { rollNo: newStudent.rollNo, branch: newStudent.branch, year: newStudent.year }
    };
    setStudents((p) => [created, ...p]);
    addAuditLog('STUDENT_ADDED', 'Admin', 'admin', `Created student ${created.name} (${created.profile.rollNo})`);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      setStudents((p) => p.filter((s) => s.id !== id));
      addAuditLog('STUDENT_DELETED', 'Admin', 'admin', `Deleted student record #${id}`);
    }
  };

  const handleCsvImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const createdList = [];
    lines.forEach((l) => {
      const parts = l.split(',').map((s) => s.trim());
      if (parts.length >= 2) {
        createdList.push({
          id: `usr_s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: parts[0],
          email: parts[1],
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          profile: { rollNo: parts[2] || '102303000', branch: parts[3] || 'CSE', year: '3rd Year' }
        });
      }
    });
    setStudents((p) => [...createdList, ...p]);
    addAuditLog('STUDENTS_CSV_IMPORT', 'Admin', 'admin', `Batch imported ${createdList.length} students`);
    setIsCsvModalOpen(false);
    setCsvText('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">Manage Students</h1>
          <p className="body-md text-secondary mt-0.5">Enrolled undergraduate and graduate records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsCsvModalOpen(true)} className="btn-secondary text-xs">
            Batch Import CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-xs">
            + Add Student
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name or roll number..."
          className="input-academic w-full pl-9"
        />
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Roll No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="p-3 font-mono font-bold text-primary">{s.profile?.rollNo}</td>
                <td className="p-3 font-medium text-secondary">{s.name}</td>
                <td className="p-3 text-secondary/70">{s.email}</td>
                <td className="p-3 text-secondary">{s.profile?.branch}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-700 hover:underline p-1 bg-transparent border-none cursor-pointer">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Add Student</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <input type="text" placeholder="Full Name" required value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="input-academic w-full" />
              <input type="email" placeholder="Email" required value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} className="input-academic w-full" />
              <input type="text" placeholder="Roll Number" required value={newStudent.rollNo} onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })} className="input-academic w-full" />
              <input type="text" placeholder="Branch / Dept" value={newStudent.branch} onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })} className="input-academic w-full" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import CSV Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCsvModalOpen(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Batch Import Students (CSV)</h3>
            <p className="body-sm text-secondary">
              Format: <code className="text-primary bg-muted p-0.5">Name, Email, RollNo, Department</code>
            </p>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Rohan Mehra, rmehra@thapar.edu, 102303512, CSE&#10;Ananya Seth, aseth@thapar.edu, 102303513, ECE"
              className="input-academic w-full font-mono text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsCsvModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleCsvImport} className="btn-primary text-xs">Import Students</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin: Manage Professors
function AdminProfessorsPage() {
  const { professors, setProfessors, addAuditLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProf, setNewProf] = useState({
    name: '',
    email: '',
    teacherCode: '',
    department: 'CSED',
    designation: 'ASSOCIATE',
    officeLocation: ''
  });

  const filtered = professors.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.profile?.teacherCode?.includes(searchTerm));

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      id: `usr_p_${Date.now()}`,
      name: newProf.name,
      email: newProf.email,
      role: 'professor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      profile: {
        teacherCode: newProf.teacherCode || `TCH-${Date.now().toString().slice(-4)}`,
        department: newProf.department,
        designation: newProf.designation,
        officeLocation: newProf.officeLocation || 'Faculty Wing',
        officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
        bio: 'Faculty researcher.',
        isOnline: true
      }
    };
    setProfessors((p) => [created, ...p]);
    addAuditLog('PROFESSOR_ADDED', 'Admin', 'admin', `Added professor ${created.name} (${created.profile.teacherCode})`);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      setProfessors((p) => p.filter((x) => x.id !== id));
      addAuditLog('PROFESSOR_REMOVED', 'Admin', 'admin', `Removed faculty member #${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">Manage Professors</h1>
          <p className="body-md text-secondary mt-0.5">Faculty directory roster & appointment configurations</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-xs">
          + Add Professor
        </button>
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Code</th>
              <th className="p-3">Faculty Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Office</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="p-3 font-mono font-bold text-primary">{p.profile?.teacherCode}</td>
                <td className="p-3 font-medium text-secondary">{p.name}</td>
                <td className="p-3 text-secondary">{p.profile?.department}</td>
                <td className="p-3 text-secondary/70">{p.profile?.designation}</td>
                <td className="p-3 text-secondary/70">{p.profile?.officeLocation}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-700 hover:underline p-1 bg-transparent border-none cursor-pointer">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Add Faculty Member</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <input type="text" placeholder="Full Name (e.g. Dr. Rajesh Kumar)" required value={newProf.name} onChange={(e) => setNewProf({ ...newProf, name: e.target.value })} className="input-academic w-full" />
              <input type="email" placeholder="Email" required value={newProf.email} onChange={(e) => setNewProf({ ...newProf, email: e.target.value })} className="input-academic w-full" />
              <input type="text" placeholder="Teacher Code (e.g. TCH-CSE-09)" required value={newProf.teacherCode} onChange={(e) => setNewProf({ ...newProf, teacherCode: e.target.value })} className="input-academic w-full" />
              <select value={newProf.department} onChange={(e) => setNewProf({ ...newProf, department: e.target.value })} className="input-academic w-full">
                <option value="CSED">CSED</option>
                <option value="Electronics">Electronics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
              <input type="text" placeholder="Office Location (e.g. Cabin C-314)" required value={newProf.officeLocation} onChange={(e) => setNewProf({ ...newProf, officeLocation: e.target.value })} className="input-academic w-full" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Save Professor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin: Manage Classrooms
function AdminClassroomsPage() {
  const { classrooms, setClassrooms, addAuditLog } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    block: 'Block B',
    floor: 'Ground Floor',
    capacity: 100,
    code: 'LT105',
    type: 'LECTURE HALL',
    location: 'Academic Central'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const created = {
      id: `cls-${Date.now()}`,
      ...newRoom,
      capacity: parseInt(newRoom.capacity),
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      amenities: ['Central Air Conditioned', 'Smart Projector'],
      directions: 'Direct central corridor access.'
    };
    setClassrooms((p) => [created, ...p]);
    addAuditLog('CLASSROOM_CREATED', 'Admin', 'admin', `Created classroom ${created.name} (${created.code})`);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this classroom?')) {
      setClassrooms((p) => p.filter((c) => c.id !== id));
      addAuditLog('CLASSROOM_DELETED', 'Admin', 'admin', `Deleted classroom #${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral gap-4">
        <div>
          <h1 className="headline-lg text-primary">Manage Classrooms & Labs</h1>
          <p className="body-md text-secondary mt-0.5">Physical halls, computing labs, and workshop spaces</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-xs">
          + Add Classroom
        </button>
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Code</th>
              <th className="p-3">Room Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Block & Floor</th>
              <th className="p-3">Capacity</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {classrooms.map((c) => (
              <tr key={c.id} className="hover:bg-muted/20">
                <td className="p-3 font-mono font-bold text-primary">{c.code}</td>
                <td className="p-3 font-medium text-secondary">{c.name}</td>
                <td className="p-3"><span className="chip-academic text-[10px]">{c.type}</span></td>
                <td className="p-3 text-secondary/70">{c.block} • {c.floor}</td>
                <td className="p-3 font-bold text-secondary">{c.capacity}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-700 hover:underline p-1 bg-transparent border-none cursor-pointer">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-secondary/50" />
          <div className="relative bg-surface w-full max-w-md border border-neutral p-6 shadow-xl z-10 flex flex-col gap-3">
            <h3 className="title-md text-primary">Add Room</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <input type="text" placeholder="Room Name (e.g. LT 105)" required value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} className="input-academic w-full" />
              <input type="text" placeholder="Room Code (e.g. LT105)" required value={newRoom.code} onChange={(e) => setNewRoom({ ...newRoom, code: e.target.value })} className="input-academic w-full" />
              <select value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })} className="input-academic w-full">
                <option value="LECTURE HALL">LECTURE HALL</option>
                <option value="LAB">LAB</option>
              </select>
              <input type="text" placeholder="Block (e.g. Block B)" value={newRoom.block} onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })} className="input-academic w-full" />
              <input type="number" placeholder="Capacity (e.g. 120)" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} className="input-academic w-full" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin: Master Meeting Requests
function AdminRequestsPage() {
  const { meetingRequests, setMeetingRequests, addAuditLog } = useApp();

  const handleCancelOverride = (id) => {
    if (confirm('Cancel this consultation request?')) {
      setMeetingRequests((p) => p.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
      addAuditLog('ADMIN_CANCEL_REQUEST', 'Admin', 'admin', `Admin cancelled request #${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Master Consultation Logs</h1>
        <p className="body-md text-secondary mt-0.5">University-wide meeting requests between students & faculty</p>
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Student</th>
              <th className="p-3">Professor</th>
              <th className="p-3">Date & Slot</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {meetingRequests.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="p-3 font-medium text-secondary">{r.studentName}</td>
                <td className="p-3 font-bold text-primary">{r.professorName}</td>
                <td className="p-3 text-secondary">{r.date} ({r.timeSlot})</td>
                <td className="p-3 text-secondary/80 max-w-xs truncate">{r.reason}</td>
                <td className="p-3">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${r.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral text-secondary'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {r.status !== 'cancelled' && (
                    <button onClick={() => handleCancelOverride(r.id)} className="text-red-700 hover:underline p-1 bg-transparent border-none cursor-pointer">
                      Override Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Admin: Timetables Master Editor
function AdminTimetablesPage() {
  const { timetables, students, professors } = useApp();
  const [selectedOwner, setSelectedOwner] = useState(students[0]?.id || 'usr_student_demo');

  const ownerTimetable = timetables.filter((t) => t.ownerId === selectedOwner);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Master Timetable Inspector</h1>
        <p className="body-md text-secondary mt-0.5">Inspect weekly period allocations for any student or faculty member</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="label-sm text-secondary">Select User Schedule:</span>
        <select
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}
          className="input-academic text-xs max-w-sm">
          <optgroup label="Students">
            {students.map((s) => (
              <option key={s.id} value={s.id}>Student: {s.name} ({s.profile?.rollNo})</option>
            ))}
          </optgroup>
          <optgroup label="Professors">
            {professors.map((p) => (
              <option key={p.id} value={p.id}>Prof: {p.name} ({p.profile?.department})</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="card-academic p-4 overflow-x-auto bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-2.5">Slot</th>
              {daysOfWeek.slice(0, 5).map((d) => (
                <th key={d} className="p-2.5 text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {timeSlots.map((slot, pIdx) => (
              <tr key={slot}>
                <td className="p-2 font-mono text-[11px] bg-muted/30 whitespace-nowrap">{slot}</td>
                {daysOfWeek.slice(0, 5).map((d) => {
                  const entry = ownerTimetable.find((t) => t.day.toLowerCase() === d.toLowerCase() && t.periodIndex === pIdx);
                  return (
                    <td key={d} className="p-1.5 border-l border-neutral text-center h-12">
                      {entry ? (
                        <div className="p-1 bg-muted border border-neutral text-[10px]">
                          <strong className="text-primary truncate block">{entry.subject}</strong>
                          <span className="text-secondary/70 truncate block">{entry.roomName}</span>
                        </div>
                      ) : (
                        <span className="text-secondary/20">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Admin: Departments Management
function AdminDepartmentsPage() {
  const { departments, setDepartments, addAuditLog } = useApp();
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    const created = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      fullName: newDeptName,
      code: newDeptCode || newDeptName.slice(0, 3).toUpperCase()
    };
    setDepartments((p) => [...p, created]);
    addAuditLog('DEPARTMENT_ADDED', 'Admin', 'admin', `Added academic department: ${created.name}`);
    setNewDeptName('');
    setNewDeptCode('');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this department?')) {
      setDepartments((p) => p.filter((d) => d.id !== id));
      addAuditLog('DEPARTMENT_DELETED', 'Admin', 'admin', `Deleted department #${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Academic Departments</h1>
        <p className="body-md text-secondary mt-0.5">Maintain university departmental hierarchy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-academic p-5 bg-white border border-neutral">
          <h3 className="title-md text-primary mb-3">Add Department</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Department Name (e.g. Biotechnology)"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="input-academic w-full"
              required
            />
            <input
              type="text"
              placeholder="Code (e.g. BT)"
              value={newDeptCode}
              onChange={(e) => setNewDeptCode(e.target.value)}
              className="input-academic w-full"
            />
            <button type="submit" className="btn-primary w-full justify-center text-xs mt-2">
              Save Department
            </button>
          </form>
        </div>

        <div className="md:col-span-2 card-academic p-5 bg-white border border-neutral">
          <h3 className="title-md text-secondary font-normal mb-3">Configured Departments ({departments.length})</h3>
          <div className="divide-y divide-neutral">
            {departments.map((d) => (
              <div key={d.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-primary mr-2 font-mono">{d.code}</span>
                  <span className="font-medium text-secondary">{d.name}</span>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-red-700 hover:underline p-1 bg-transparent border-none cursor-pointer">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin: Chronological Audit Log Page
function AdminAuditLogPage() {
  const { auditLogs } = useApp();

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">System Audit Log</h1>
        <p className="body-md text-secondary mt-0.5">Chronological record of logins, meeting transactions & schedule edits</p>
      </div>

      <div className="card-academic overflow-hidden bg-white border border-neutral">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-neutral text-secondary font-medium">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor & Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/20">
                <td className="p-3 font-mono text-secondary/60 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="p-3">
                  <div className="font-medium text-secondary">{log.actorName}</div>
                  <span className="text-[10px] uppercase font-bold text-primary">{log.actorRole}</span>
                </td>
                <td className="p-3">
                  <span className="chip-academic text-[10px]">{log.action}</span>
                </td>
                <td className="p-3 text-secondary/90 leading-relaxed">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 12. ROOT APPLICATION WITH ROUTING
// ==========================================
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <PageLayout>
          <Routes>
            {/* Root redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthGateway />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/auth/student-login" element={<StudentLogin />} />
            <Route path="/auth/student-signup" element={<StudentSignup />} />
            <Route path="/auth/professor-login" element={<ProfessorLogin />} />
            <Route path="/auth/professor-signup" element={<ProfessorSignup />} />
            <Route path="/auth/admin-login" element={<AdminLogin />} />

            {/* Student & Faculty Overview / Academic Routes ONLY */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/classroom" element={<ClassroomFinder />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/professors" element={<ProfessorsDirectory />} />
            <Route path="/students" element={<StudentsDirectory />} />

            {/* Admin Management Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/professors" element={<AdminProfessorsPage />} />
            <Route path="/admin/classrooms" element={<AdminClassroomsPage />} />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
            <Route path="/admin/timetables" element={<AdminTimetablesPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
