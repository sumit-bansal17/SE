import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Bell, BookOpen, Briefcase, CalendarDays, ClipboardList, DoorOpen,
  FileStack, GraduationCap, LayoutDashboard, MapPin, Menu, Search, Settings,
  Users, X, Check, Clock, Plus, Navigation, Flame, Play, Pause, RotateCcw,
  CheckCircle, Tv, Wind, Compass, Phone, FileUp, AlertCircle, LogOut, ArrowRight,
  UserCheck, ShieldCheck
} from 'lucide-react';

import {
  defaultStudent, defaultProfessor, sampleTimetable, initialTasks, initialNotifications,
  classroomsData, professorsData, academicCalendarEvents, academicResources, initialRequests
} from './data';

// ==========================================
// 1. APP CONTEXT & AUTH STATE
// ==========================================
const AppContext = createContext();

export function AppProvider({ children }) {
  // Current logged in user (or null if guest/logged out)
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('snaplocate_academic_user');
    return s ? JSON.parse(s) : defaultStudent; // defaults to logged-in student for instant demo
  });

  const [timetable, setTimetable] = useState(sampleTimetable);
  const [tasks, setTasks] = useState(() => {
    const s = localStorage.getItem('snaplocate_academic_tasks');
    return s ? JSON.parse(s) : initialTasks;
  });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [requests, setRequests] = useState(() => {
    const s = localStorage.getItem('snaplocate_academic_requests');
    return s ? JSON.parse(s) : initialRequests;
  });

  // Login handler
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('snaplocate_academic_user', JSON.stringify(userData));
  };

  // Logout handler
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('snaplocate_academic_user');
  };

  useEffect(() => {
    localStorage.setItem('snaplocate_academic_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('snaplocate_academic_requests', JSON.stringify(requests));
  }, [requests]);

  // Tasks actions
  const toggleTask = (id) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)));
  const addTask = (label, sub = 'Academic task', category = 'Coursework') => setTasks((p) => [{ id: `tsk-${Date.now()}`, label, sub, category, is_done: false }, ...p]);
  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));

  // Notifications actions
  const markNotificationRead = (id) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  const markAllNotificationsRead = () => setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  const deleteNotification = (id) => setNotifications((p) => p.filter((n) => n.id !== id));

  // Consultation Requests actions
  const addRequest = (newReq) => setRequests((p) => [{ ...newReq, id: `req-${Date.now()}`, status: 'Pending' }, ...p]);
  const updateRequestStatus = (id, newStatus) => setRequests((p) => p.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));

  return (
    <AppContext.Provider value={{
      user, loginUser, logoutUser, timetable, tasks, toggleTask, addTask, deleteTask,
      notifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
      requests, addRequest, updateRequestStatus
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
  const { user, logoutUser, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Strict: Overview and Academic Sections ONLY
  const studentNav = [
    { section: 'OVERVIEW' },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { section: 'ACADEMIC' },
    { label: 'Classroom', path: '/classroom', icon: DoorOpen },
    { label: 'Work-Space', path: '/workspace', icon: Briefcase },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Resources', path: '/resources', icon: FileStack },
    { label: 'My Requests', path: '/requests', icon: ClipboardList, badge: requestsCount(user) },
    { label: 'Professor', path: '/professors', icon: Users },
  ];

  const professorNav = [
    { section: 'OVERVIEW' },
    { label: 'Faculty Portal', path: '/faculty/dashboard', icon: LayoutDashboard },
    { section: 'ACADEMIC' },
    { label: 'Classroom', path: '/classroom', icon: DoorOpen },
    { label: 'Work-Space', path: '/workspace', icon: Briefcase },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Resources', path: '/resources', icon: FileStack },
    { label: 'Student Requests', path: '/requests', icon: ClipboardList, badge: requestsCount(user) },
    { label: 'Professor', path: '/professors', icon: Users },
  ];

  function requestsCount(u) {
    return 1;
  }

  const currentNav = user?.role === 'professor' ? professorNav : studentNav;

  return (
    <div className="min-h-screen bg-background text-on-surface font-roboto flex flex-col selection:bg-primary selection:text-white">
      {/* Top Header - Restrained Institutional Header */}
      <header className="sticky top-0 w-full h-[64px] bg-surface border-b border-neutral z-50 px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setMobileMenuOpen(true)} className="flex lg:hidden p-2 rounded-none bg-transparent border-none cursor-pointer text-secondary hover:bg-neutral/30">
            <Menu size={22} />
          </button>
          <div onClick={() => navigate(user?.role === 'professor' ? '/faculty/dashboard' : '/dashboard')} className="flex items-center gap-3 cursor-pointer select-none">
            <img src="/images/snaplocate-icon.svg" alt="SnapLocate" className="w-8 h-8 rounded-none" />
            <div>
              <div className="text-[17px] font-bold text-primary leading-tight flex items-center gap-2">
                SnapLocate
                <span className="text-[11px] font-normal tracking-wide text-secondary border-l border-neutral pl-2 uppercase">Thapar Academic OS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 rounded-none bg-transparent border-none cursor-pointer text-secondary hover:bg-neutral/40 transition-colors" title="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-none bg-primary text-white text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="fixed sm:absolute top-[64px] sm:top-10 right-2 sm:right-0 sm:w-[320px] bg-surface border border-neutral shadow-md z-50">
                <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-neutral bg-muted">
                  <span className="label-sm uppercase font-normal text-secondary">Academic Notices ({unreadCount})</span>
                  {unreadCount > 0 && <button onClick={markAllNotificationsRead} className="btn-tertiary text-xs">Mark all read</button>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-neutral">
                  {notifications.map((n) => (
                    <div key={n.id} onClick={() => { markNotificationRead(n.id); navigate(n.link || '/dashboard'); setNotificationsOpen(false); }} className={`p-3 cursor-pointer hover:bg-muted transition-colors ${n.is_read ? 'opacity-80' : 'bg-muted/40'}`}>
                      <div className="text-xs font-normal text-primary">{n.title}</div>
                      <div className="body-sm text-secondary mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-neutral" />

          {/* User profile & Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="text-xs font-normal text-secondary">{user.full_name}</div>
                <div className="text-[11px] font-normal text-primary uppercase tracking-wider">{user.role === 'professor' ? 'Faculty Portal' : 'Student'}</div>
              </div>
              <span className={user.role === 'professor' ? 'chip-academic-maroon' : 'chip-academic'}>
                {user.role === 'professor' ? 'PROFESSOR' : 'STUDENT'}
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

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-[1500px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[230px] shrink-0 border-r border-neutral py-6 px-3 bg-surface sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {currentNav.map((item, idx) => {
              if (item.section) return <div key={idx} className="label-sm uppercase font-normal text-secondary/70 px-3 pt-4 pb-1 tracking-wider">{item.section}</div>;
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/dashboard' || item.path === '/faculty/dashboard'}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-2 text-xs font-normal transition-colors no-underline ${isActive ? 'bg-primary text-white font-medium' : 'text-secondary hover:bg-neutral/40'}`}>
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-secondary'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <span className={`text-[10px] px-1.5 py-0.2 ${isActive ? 'bg-white text-primary' : 'bg-neutral text-secondary'}`}>{item.badge}</span>}
                    </>
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
                <div className="font-bold text-primary text-base">SnapLocate</div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-secondary bg-transparent border-none cursor-pointer"><X size={18} /></button>
              </div>
              {currentNav.map((item, idx) => {
                if (item.section) return <div key={idx} className="text-[11px] font-normal uppercase text-secondary/70 px-2 pt-3">{item.section}</div>;
                const Icon = item.icon;
                return (
                  <NavLink key={`m-${item.path}`} to={item.path} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-secondary hover:bg-neutral/30 no-underline">
                    <Icon size={16} /><span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-7 min-w-0 max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 3. AUTH PORTALS (SEPARATE STUDENT & PROFESSOR PAGES)
// ==========================================

// Portal Gateway / Selection Screen
function AuthGateway() {
  const navigate = useNavigate();
  const { loginUser } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        {/* Institutional Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <img src="/images/snaplocate-icon.svg" alt="" className="w-10 h-10 rounded-none" />
            <span className="headline-display text-primary">SnapLocate</span>
          </div>
          <h1 className="headline-md text-secondary mt-1">Thapar Institute of Engineering & Technology</h1>
          <p className="body-md text-secondary/80 mt-1">Unified Campus Academic Operating System</p>
        </div>

        {/* Two Separate Portal Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Portal Card */}
          <div className="card-academic flex flex-col justify-between hover:border-primary transition-colors p-6">
            <div>
              <div className="chip-academic mb-3">STUDENT ACCESS</div>
              <h2 className="title-md text-primary font-normal">Student Academic Portal</h2>
              <p className="body-sm text-secondary mt-2 leading-relaxed">
                Log in to check lecture timetables, navigate classrooms across Block B and Lecture Pavilion, track 75% attendance, and book faculty consultations.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mt-6 pt-4 border-t border-neutral">
              <button onClick={() => navigate('/auth/student-login')} className="btn-primary w-full justify-center">
                Student Sign In
              </button>
              <button onClick={() => navigate('/auth/student-signup')} className="btn-secondary w-full justify-center">
                New Student Registration
              </button>
              <button onClick={() => { loginUser(defaultStudent); navigate('/dashboard'); }} className="btn-tertiary text-xs justify-center mt-1">
                ⚡ Instant Student Demo Login
              </button>
            </div>
          </div>

          {/* Professor / Faculty Portal Card */}
          <div className="card-academic flex flex-col justify-between hover:border-primary transition-colors p-6">
            <div>
              <div className="chip-academic-maroon mb-3">FACULTY ACCESS</div>
              <h2 className="title-md text-primary font-normal">Faculty / Professor Portal</h2>
              <p className="body-sm text-secondary mt-2 leading-relaxed">
                Log in to review assigned lecture theatres, update cabin consultation availability, approve student doubts, and publish academic question banks.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 mt-6 pt-4 border-t border-neutral">
              <button onClick={() => navigate('/auth/professor-login')} className="btn-primary w-full justify-center">
                Faculty Sign In
              </button>
              <button onClick={() => navigate('/auth/professor-signup')} className="btn-secondary w-full justify-center">
                New Faculty Registration
              </button>
              <button onClick={() => { loginUser(defaultProfessor); navigate('/faculty/dashboard'); }} className="btn-tertiary text-xs justify-center mt-1">
                ⚡ Instant Professor Demo Login
              </button>
            </div>
          </div>
        </div>

        <div className="text-center body-sm text-secondary/60">
          Academic Affairs Administration • Thapar Institute of Engineering & Technology, Patiala
        </div>
      </div>
    </div>
  );
}

// Student Login Page
function StudentLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      ...defaultStudent,
      email: email || defaultStudent.email,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md card-academic p-8">
        <div className="mb-6">
          <Link to="/auth" className="btn-tertiary text-xs mb-3">← Back to Portal Selection</Link>
          <div className="chip-academic mb-2">STUDENT PORTAL</div>
          <h1 className="headline-sm text-primary font-normal">Student Sign In</h1>
          <p className="body-sm text-secondary mt-1">Enter your Thapar university credentials to access academic dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">University Email or Roll Number</label>
            <input type="text" required placeholder="e.g. asharma_be23@thapar.edu or 102303492" value={email} onChange={(e) => setEmail(e.target.value)} className="input-academic w-full" />
          </div>
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Webkiosk / Academic Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-academic w-full" />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">Sign In to Student OS</button>
        </form>

        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-neutral text-center">
          <button onClick={() => { loginUser(defaultStudent); navigate('/dashboard'); }} className="btn-secondary w-full justify-center">
            ⚡ Demo Student One-Click Sign In
          </button>
          <p className="body-sm text-secondary mt-2">
            New student? <Link to="/auth/student-signup" className="text-primary font-medium hover:underline">Register your student account</Link>
          </p>
          <p className="body-sm text-secondary">
            Faculty member? <Link to="/auth/professor-login" className="text-primary font-medium hover:underline">Faculty login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Student Signup Page
function StudentSignup() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [batch, setBatch] = useState('2023-2027');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      id: `usr_student_${Date.now()}`,
      full_name: name || 'Student User',
      email: email || `${rollNo}@thapar.edu`,
      role: 'student',
      department,
      batch,
      roll_no: rollNo || '102303001',
      avatar_url: defaultStudent.avatar_url,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-lg card-academic p-8">
        <div className="mb-6">
          <Link to="/auth" className="btn-tertiary text-xs mb-3">← Back to Portal Selection</Link>
          <div className="chip-academic mb-2">STUDENT REGISTRATION</div>
          <h1 className="headline-sm text-primary font-normal">Create Student Account</h1>
          <p className="body-sm text-secondary mt-1">Register for your academic timetable, classroom locator, and course resources.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Full Legal Name</label>
            <input type="text" required placeholder="e.g. Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} className="input-academic w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">University Roll Number</label>
              <input type="text" required placeholder="e.g. 102303492" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="input-academic w-full" />
            </div>
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Thapar Email (@thapar.edu)</label>
              <input type="email" required placeholder="asharma_be23@thapar.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="input-academic w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Academic Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-academic w-full">
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Academic Batch</label>
              <select value={batch} onChange={(e) => setBatch(e.target.value)} className="input-academic w-full">
                <option value="2023-2027">2023 - 2027</option>
                <option value="2022-2026">2022 - 2026</option>
                <option value="2024-2028">2024 - 2028</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Password</label>
            <input type="password" required placeholder="••••••••" className="input-academic w-full" />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">Complete Student Registration</button>
        </form>

        <div className="mt-4 pt-3 border-t border-neutral text-center">
          <p className="body-sm text-secondary">
            Already registered? <Link to="/auth/student-login" className="text-primary font-medium hover:underline">Sign in to Student Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Professor / Faculty Login Page
function ProfessorLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      ...defaultProfessor,
      email: email || defaultProfessor.email,
    });
    navigate('/faculty/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md card-academic p-8">
        <div className="mb-6">
          <Link to="/auth" className="btn-tertiary text-xs mb-3">← Back to Portal Selection</Link>
          <div className="chip-academic-maroon mb-2">FACULTY PORTAL</div>
          <h1 className="headline-sm text-primary font-normal">Professor Sign In</h1>
          <p className="body-sm text-secondary mt-1">Official faculty login for teaching schedules and consultation management.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Official Faculty Email</label>
            <input type="email" required placeholder="e.g. rkumar@thapar.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="input-academic w-full" />
          </div>
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Faculty Portal Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-academic w-full" />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">Sign In to Faculty Portal</button>
        </form>

        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-neutral text-center">
          <button onClick={() => { loginUser(defaultProfessor); navigate('/faculty/dashboard'); }} className="btn-secondary w-full justify-center">
            ⚡ Demo Professor One-Click Sign In
          </button>
          <p className="body-sm text-secondary mt-2">
            New Faculty Member? <Link to="/auth/professor-signup" className="text-primary font-medium hover:underline">Register faculty credentials</Link>
          </p>
          <p className="body-sm text-secondary">
            Enrolled Student? <Link to="/auth/student-login" className="text-primary font-medium hover:underline">Student login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Professor / Faculty Signup Page
function ProfessorSignup() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [cabin, setCabin] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Associate Professor');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser({
      id: `usr_prof_${Date.now()}`,
      full_name: name || 'Dr. Faculty Member',
      email: email || `${employeeId}@thapar.edu`,
      role: 'professor',
      department,
      designation,
      cabin: cabin || 'Cabin C-314, Block C',
      employee_id: employeeId || 'FAC-1001',
      officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
      avatar_url: defaultProfessor.avatar_url,
    });
    navigate('/faculty/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-lg card-academic p-8">
        <div className="mb-6">
          <Link to="/auth" className="btn-tertiary text-xs mb-3">← Back to Portal Selection</Link>
          <div className="chip-academic-maroon mb-2">FACULTY ONBOARDING</div>
          <h1 className="headline-sm text-primary font-normal">Register Faculty Profile</h1>
          <p className="body-sm text-secondary mt-1">Configure your official faculty cabin, office consultation hours, and lecture slots.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Faculty Name (with Title)</label>
            <input type="text" required placeholder="e.g. Dr. Rajesh Kumar" value={name} onChange={(e) => setName(e.target.value)} className="input-academic w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Employee / Faculty ID</label>
              <input type="text" required placeholder="e.g. FAC-2041" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input-academic w-full" />
            </div>
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Official Email (@thapar.edu)</label>
              <input type="email" required placeholder="rkumar@thapar.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="input-academic w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Academic Designation</label>
              <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="input-academic w-full">
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor & Head">Professor & Head</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Visiting Faculty">Visiting Faculty</option>
              </select>
            </div>
            <div>
              <label className="label-sm text-secondary uppercase block mb-1">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-academic w-full">
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mathematics & Data Science">Mathematics & Data Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Faculty Cabin Location</label>
            <input type="text" required placeholder="e.g. Cabin C-314, Block C, 3rd Floor" value={cabin} onChange={(e) => setCabin(e.target.value)} className="input-academic w-full" />
          </div>
          <div>
            <label className="label-sm text-secondary uppercase block mb-1">Password</label>
            <input type="password" required placeholder="••••••••" className="input-academic w-full" />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">Complete Faculty Onboarding</button>
        </form>

        <div className="mt-4 pt-3 border-t border-neutral text-center">
          <p className="body-sm text-secondary">
            Already registered? <Link to="/auth/professor-login" className="text-primary font-medium hover:underline">Sign in to Faculty Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. STUDENT DASHBOARD VIEW
// ==========================================
function StudentDashboard() {
  const { user, timetable, tasks, toggleTask, addTask } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scheduleView, setScheduleView] = useState('day');
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const greeting = currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.full_name || 'Student').split(' ')[0];
  const todayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const todayClasses = useMemo(() => {
    const curMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    return timetable.filter((c) => c.day?.toUpperCase() === todayName).map((c) => {
      const [start, end] = (c.time_slot || '00:00-23:59').split('-');
      const [sh, sm] = (start || '00:00').trim().split(':').map(Number);
      const [eh, em] = (end || '23:59').trim().split(':').map(Number);
      const sTotal = sh * 60 + (sm || 0);
      const eTotal = eh * 60 + (em || 0);
      let status = 'upcoming';
      if (curMins >= sTotal && curMins <= eTotal) status = 'ongoing';
      else if (curMins > eTotal) status = 'completed';
      return { ...c, startMins: sTotal, status };
    }).sort((a, b) => a.startMins - b.startMins);
  }, [timetable, todayName, currentTime]);

  const activeClass = todayClasses.find((c) => c.status === 'ongoing') || todayClasses.find((c) => c.status === 'upcoming') || todayClasses[0];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Institutional Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral">
        <div>
          <h1 className="headline-lg text-primary">{greeting}, {firstName}</h1>
          <p className="body-md text-secondary mt-0.5">Here is your academic schedule and coursework for today.</p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <div className="card-academic py-1.5 px-3 label-sm text-secondary">
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="card-academic py-1.5 px-3 label-sm text-secondary flex items-center gap-1.5">
            <Clock size={13} className="text-primary" />
            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Row 1: Next Class Card + Tasks Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Next Class Hero Card */}
        <div className="lg:col-span-7 card-academic p-6 flex flex-col justify-between border-t-2 border-t-primary">
          {activeClass ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className={activeClass.status === 'ongoing' ? 'chip-academic-maroon' : 'chip-academic'}>
                  {activeClass.status === 'ongoing' ? 'IN PROGRESS' : 'UP NEXT'}
                </span>
                <span className="label-sm text-secondary">{activeClass.day} • {activeClass.type}</span>
              </div>

              <div>
                <div className="headline-display text-secondary">{activeClass.time_slot}</div>
                <h2 className="title-md text-primary mt-1 font-normal">{activeClass.course}</h2>
                <p className="body-sm text-secondary mt-0.5">Instructor: {activeClass.instructor}</p>
              </div>

              {/* Location Card with step-by-step navigation */}
              <div onClick={() => navigate('/classroom', { state: { search: activeClass.location } })}
                className="mt-2 p-3.5 bg-muted border border-neutral flex justify-between items-center cursor-pointer hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface border border-neutral flex items-center justify-center text-primary">
                    <DoorOpen size={18} />
                  </div>
                  <div>
                    <span className="label-sm uppercase text-secondary/70 block">Assigned Hall</span>
                    <span className="title-md text-primary font-normal">{activeClass.location}</span>
                  </div>
                </div>
                <span className="btn-tertiary text-xs">Find on Map →</span>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center body-md text-secondary">
              No further lectures scheduled for today.
            </div>
          )}
        </div>

        {/* Tasks Hub */}
        <div className="lg:col-span-5 card-academic p-6 flex flex-col justify-between border-t-2 border-t-tertiary">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="title-md text-secondary font-normal">Assignment Tasks</h3>
              <button onClick={() => navigate('/workspace')} className="btn-tertiary text-xs">View Workspace</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-2.5 bg-muted/60 border border-neutral flex items-start gap-2.5">
                  <input type="checkbox" checked={task.is_done} onChange={() => toggleTask(task.id)} className="mt-0.5 accent-primary cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <div className={`body-sm text-secondary truncate ${task.is_done ? 'line-through opacity-60' : ''}`}>{task.label}</div>
                    <div className="label-sm text-secondary/60 truncate">{task.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (taskInput.trim()) { addTask(taskInput.trim()); setTaskInput(''); } }} className="mt-4 pt-3 border-t border-neutral flex gap-2">
            <input type="text" placeholder="Add study task..." value={taskInput} onChange={(e) => setTaskInput(e.target.value)} className="input-academic flex-1" />
            <button type="submit" className="btn-primary px-3 text-xs">Add</button>
          </form>
        </div>
      </div>

      {/* Row 2: Timetable Schedule & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 card-academic p-6">
          <div className="flex justify-between items-center pb-3 border-b border-neutral mb-4">
            <h3 className="title-md text-primary font-normal">{scheduleView === 'day' ? "Today's Class Schedule" : 'Full Weekly Timetable'}</h3>
            <div className="flex border border-neutral">
              {['day', 'week'].map((v) => (
                <button key={v} onClick={() => setScheduleView(v)} className={`px-3 py-1 text-xs uppercase font-normal border-none cursor-pointer ${scheduleView === v ? 'bg-tertiary text-white' : 'bg-surface text-secondary'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {scheduleView === 'day' ? (
            <div className="flex flex-col gap-3">
              {todayClasses.map((c, i) => (
                <div key={i} className="p-3 bg-muted/40 border border-neutral flex justify-between items-center">
                  <div>
                    <div className="label-lg text-primary font-medium">{c.course}</div>
                    <div className="body-sm text-secondary mt-0.5">{c.location} • {c.time_slot}</div>
                  </div>
                  <span className="chip-academic">{c.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((d) => (
                <div key={d} className="p-3 bg-muted/50 border border-neutral">
                  <div className="label-sm uppercase font-bold text-primary mb-1.5">{d}</div>
                  <div className="flex flex-col gap-1.5">
                    {timetable.filter((t) => t.day === d).map((t, idx) => (
                      <div key={idx} className="body-sm text-secondary bg-surface p-1.5 border border-neutral">
                        <span className="font-normal text-primary">{t.course.split(':')[0]}</span> ({t.time_slot})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Notices */}
        <div className="lg:col-span-4 card-academic p-6 flex flex-col justify-between">
          <div>
            <h3 className="title-md text-secondary font-normal mb-3">Academic Circulars</h3>
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-muted border border-neutral">
                <span className="chip-academic-maroon text-[10px] mb-1">OFFICIAL NOTICE</span>
                <div className="body-sm text-secondary mt-1 font-medium">Mid-Semester Test (MST) Schedule</div>
                <div className="label-sm text-secondary/70 mt-0.5">Nov 10 - Nov 16 across Lecture Theatres</div>
              </div>
              <div className="p-3 bg-muted border border-neutral">
                <span className="chip-academic text-[10px] mb-1">LAB DEADLINE</span>
                <div className="body-sm text-secondary mt-1 font-medium">Practical File Verification</div>
                <div className="label-sm text-secondary/70 mt-0.5">Submit to respective lab instructors</div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/calendar')} className="btn-secondary w-full justify-center mt-4">
            View Full Academic Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PROFESSOR / FACULTY DASHBOARD VIEW
// ==========================================
function FacultyDashboard() {
  const { user, requests, updateRequestStatus } = useApp();
  const [cabinStatus, setCabinStatus] = useState('Available in Cabin');

  const pendingRequests = requests.filter((r) => r.status === 'Pending');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral">
        <div>
          <h1 className="headline-lg text-primary">Faculty Academic Portal</h1>
          <p className="body-md text-secondary mt-0.5">Welcome, {user?.full_name}. Here is your teaching schedule and student consultation desk.</p>
        </div>
        <div className="flex items-center gap-2 card-academic py-1.5 px-3">
          <span className="label-sm text-secondary">Cabin Status:</span>
          <select value={cabinStatus} onChange={(e) => setCabinStatus(e.target.value)} className="input-academic h-[28px] text-xs py-0">
            <option value="Available in Cabin">🟢 Available in Cabin C-314</option>
            <option value="In Lecture Hall">🟡 In Lecture Hall (LT 101)</option>
            <option value="Meeting / Away">⚪ Away / Duty</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Today's Teaching Schedule */}
        <div className="lg:col-span-7 card-academic p-6 border-t-2 border-t-primary">
          <h2 className="title-md text-primary font-normal mb-4">Assigned Lectures for Today</h2>
          <div className="flex flex-col gap-3">
            {[
              { time: '08:50 AM - 09:40 AM', course: 'UCS405: Operating Systems', location: 'LT 101 (Block B)', strength: '142 Students' },
              { time: '11:20 AM - 01:00 PM', course: 'UCS405: OS Laboratory', location: 'CS Lab 3 (C-Block)', strength: '65 Students' },
              { time: '03:00 PM - 05:00 PM', course: 'Office Consultation & Doubts', location: 'Cabin C-314', strength: 'Student Hours' },
            ].map((lec, idx) => (
              <div key={idx} className="p-3 bg-muted/60 border border-neutral flex justify-between items-center">
                <div>
                  <div className="label-lg text-primary font-medium">{lec.course}</div>
                  <div className="body-sm text-secondary mt-0.5">{lec.time} • {lec.location}</div>
                </div>
                <span className="chip-academic">{lec.strength}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral">
            <h3 className="label-lg text-secondary uppercase font-normal mb-2">Publish Subject Materials</h3>
            <p className="body-sm text-secondary mb-3">Upload lecture slides and previous year question banks to student resources.</p>
            <button onClick={() => alert('File upload dialog opened.')} className="btn-secondary flex items-center gap-2">
              <FileUp size={15} /> Upload Course PDF / PYQ
            </button>
          </div>
        </div>

        {/* Student Meeting Requests */}
        <div className="lg:col-span-5 card-academic p-6 border-t-2 border-t-tertiary flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="title-md text-secondary font-normal">Student Consultation Requests</h2>
              <span className="chip-academic-maroon text-[10px]">{pendingRequests.length} PENDING</span>
            </div>
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <div key={req.id} className="p-3 bg-muted border border-neutral">
                  <div className="flex justify-between items-start">
                    <span className="label-md font-medium text-primary">{req.studentName} ({req.studentRoll})</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral text-secondary'}`}>{req.status}</span>
                  </div>
                  <div className="body-sm text-secondary mt-1">{req.topic}</div>
                  <div className="label-sm text-primary mt-1">Requested Slot: {req.slot}</div>

                  {req.status === 'Pending' && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-neutral">
                      <button onClick={() => updateRequestStatus(req.id, 'Approved')} className="btn-primary text-xs h-[30px] flex-1">Approve Slot</button>
                      <button onClick={() => updateRequestStatus(req.id, 'Rescheduled')} className="btn-secondary text-xs h-[30px] flex-1">Reschedule</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. CLASSROOM & HALL LOCATOR VIEW
// ==========================================
function ClassroomFinder() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  const [selectedClass, setSelectedClass] = useState(classroomsData[0]);

  const filtered = classroomsData.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Classroom & Hall Locator</h1>
        <p className="body-md text-secondary mt-0.5">Official navigation codes, floor plans, and cabin directions across TIET campus.</p>
      </div>

      <div className="relative">
        <input type="text" placeholder="Search by room code (e.g. LT 101, LP 104, CS Lab 3, Block B)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-academic w-full pl-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setSelectedClass(c)} className={`card-academic cursor-pointer transition-colors border ${selectedClass?.id === c.id ? 'border-primary bg-muted/40' : 'hover:border-neutral'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="title-md text-primary font-normal">{c.code}</div>
                  <div className="body-sm text-secondary mt-0.5">{c.name}</div>
                </div>
                <span className="chip-academic text-[10px]">{c.floor}</span>
              </div>
              <div className="body-sm text-secondary mt-2 pt-2 border-t border-neutral flex items-center gap-2">
                <MapPin size={13} className="text-primary" /> {c.block} • {c.capacity} seats
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {selectedClass && (
            <div className="card-academic p-6 flex flex-col gap-4 sticky top-24 border-t-2 border-t-primary">
              <div className="flex justify-between items-center pb-3 border-b border-neutral">
                <div>
                  <h2 className="headline-sm text-primary font-normal">{selectedClass.code}</h2>
                  <p className="body-sm text-secondary mt-0.5">{selectedClass.name}</p>
                </div>
                <span className="chip-academic-maroon">Active Venue</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-muted border border-neutral"><span className="label-sm uppercase text-secondary/70 block">Building</span><span className="body-sm font-medium text-primary mt-0.5 block">{selectedClass.block}</span></div>
                <div className="p-3 bg-muted border border-neutral"><span className="label-sm uppercase text-secondary/70 block">Floor</span><span className="body-sm font-medium text-secondary mt-0.5 block">{selectedClass.floor}</span></div>
                <div className="p-3 bg-muted border border-neutral"><span className="label-sm uppercase text-secondary/70 block">Capacity</span><span className="body-sm font-medium text-secondary mt-0.5 block">{selectedClass.capacity} Seats</span></div>
              </div>

              <div className="p-4 bg-muted border-l-2 border-l-primary">
                <div className="label-md font-medium text-primary mb-1 flex items-center gap-1.5"><Navigation size={14} /> Wayfinding & Directions</div>
                <p className="body-sm text-secondary leading-relaxed">{selectedClass.directions}</p>
              </div>

              <div className="p-8 border border-neutral bg-surface flex flex-col items-center justify-center text-center">
                <DoorOpen size={36} className="text-primary mb-2" />
                <div className="title-md font-normal text-secondary">Floorplan Blueprint: {selectedClass.block}</div>
                <p className="body-sm text-secondary/70 mt-1 max-w-sm">Direct entry via Central Courridor opposite Academic Dean Office. Wheelchair ramp accessible on West wing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. PROFESSORS DIRECTORY & CABINS
// ==========================================
function ProfessorsDirectory() {
  const { addRequest, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingProf, setBookingProf] = useState(null);
  const [slot, setSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [booked, setBooked] = useState(false);

  const filtered = professorsData.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cabin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (e) => {
    e.preventDefault();
    addRequest({
      studentName: user?.full_name || 'Aarav Sharma',
      studentRoll: user?.roll_no || '102303492',
      professorName: bookingProf.name,
      cabin: bookingProf.cabin,
      topic: topic || 'Coursework Consultation',
      slot: slot || 'Tomorrow 03:30 PM',
    });
    setBooked(true);
    setTimeout(() => { setBooked(false); setBookingProf(null); setSlot(''); setTopic(''); }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Faculty Directory & Cabins</h1>
        <p className="body-md text-secondary mt-0.5">Locate faculty cabins, view consultation office hours, and schedule academic appointments.</p>
      </div>

      <input type="text" placeholder="Search by faculty name, cabin number, research topic..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-academic w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((prof) => (
          <div key={prof.id} className="card-academic p-5 flex flex-col justify-between border-t-2 border-t-primary">
            <div>
              <div className="flex items-start gap-3.5">
                <img src={prof.avatar} alt="" className="w-14 h-14 rounded-none object-cover border border-neutral shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="title-md text-primary font-normal truncate">{prof.name}</h3>
                    <span className={`w-2 h-2 rounded-none ${prof.available ? 'bg-emerald-600' : 'bg-amber-600'}`} title={prof.available ? 'In Cabin' : 'In Lecture'} />
                  </div>
                  <div className="body-sm text-secondary">{prof.designation}</div>
                  <div className="label-sm text-primary font-medium mt-0.5">{prof.department}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs">
                <div className="p-2 bg-muted border border-neutral body-sm text-secondary">
                  <span className="font-medium text-primary">Cabin Location:</span> {prof.cabin}
                </div>
                <div className="body-sm text-secondary">
                  <span className="font-medium text-secondary">Office Consultation Hours:</span> {prof.officeHours}
                </div>
                <div className="body-sm text-secondary">
                  <span className="font-medium text-secondary">Official Email:</span> <a href={`mailto:${prof.email}`} className="text-primary hover:underline">{prof.email}</a>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral flex gap-2">
              <button onClick={() => setBookingProf(prof)} className="btn-primary flex-1 justify-center text-xs">Schedule Consultation</button>
              <a href={`mailto:${prof.email}`} className="btn-secondary text-xs text-decoration-none">Email Faculty</a>
            </div>
          </div>
        ))}
      </div>

      {bookingProf && (
        <div className="fixed inset-0 z-50 bg-secondary/50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md card-academic p-6 border-2 border-primary shadow-lg">
            {booked ? (
              <div className="py-6 text-center flex flex-col items-center gap-2">
                <CheckCircle size={36} className="text-primary" />
                <h3 className="title-md text-primary font-normal">Consultation Request Dispatched</h3>
                <p className="body-sm text-secondary">{bookingProf.name} will confirm the slot on your portal.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-neutral">
                  <h3 className="title-md text-primary font-normal">Book Meeting: {bookingProf.name}</h3>
                  <button type="button" onClick={() => setBookingProf(null)} className="p-1 text-secondary bg-transparent border-none cursor-pointer"><X size={18} /></button>
                </div>
                <div>
                  <label className="label-sm text-secondary uppercase block mb-1">Preferred Consultation Slot</label>
                  <input type="text" required placeholder="e.g. Wednesday 03:30 PM (during office hours)" value={slot} onChange={(e) => setSlot(e.target.value)} className="input-academic w-full" />
                </div>
                <div>
                  <label className="label-sm text-secondary uppercase block mb-1">Coursework Query / Subject</label>
                  <textarea rows={3} required placeholder="State your doubts or thesis project discussion..." value={topic} onChange={(e) => setTopic(e.target.value)} className="input-academic w-full h-auto py-2" />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button type="button" onClick={() => setBookingProf(null)} className="btn-secondary text-xs">Cancel</button>
                  <button type="submit" className="btn-primary text-xs">Submit Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. WORKSPACE & ACADEMIC TOOLS VIEW
// ==========================================
function WorkspacePage() {
  const { tasks, toggleTask, addTask, deleteTask } = useApp();
  const [taskText, setTaskText] = useState('');
  const [pomodoroMode, setPomodoroMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    else if (timeLeft === 0) {
      setPomodoroMode((m) => (m === 'focus' ? 'break' : 'focus'));
      setTimeLeft(pomodoroMode === 'focus' ? 5 * 60 : 25 * 60);
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, pomodoroMode]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Academic Workspace</h1>
        <p className="body-md text-secondary mt-0.5">Coursework assignment board, deep-focus Pomodoro timer, and mandatory 75% attendance criteria monitor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Assignment Checklist */}
        <div className="lg:col-span-7 card-academic p-6 border-t-2 border-t-primary flex flex-col justify-between">
          <div>
            <h2 className="title-md text-primary font-normal mb-3">Coursework & Lab Checklist</h2>
            <form onSubmit={(e) => { e.preventDefault(); if (taskText.trim()) { addTask(taskText.trim()); setTaskText(''); } }} className="flex gap-2 mb-4">
              <input type="text" placeholder="Add coursework task..." value={taskText} onChange={(e) => setTaskText(e.target.value)} className="input-academic flex-1" />
              <button type="submit" className="btn-primary text-xs">Add Task</button>
            </form>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 bg-muted/50 border border-neutral flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={task.is_done} onChange={() => toggleTask(task.id)} className="accent-primary cursor-pointer" />
                    <div>
                      <span className={`body-sm text-secondary ${task.is_done ? 'line-through opacity-60' : ''}`}>{task.label}</span>
                      <div className="label-sm text-secondary/60">{task.sub}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="btn-tertiary text-xs text-error">Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* 75% Attendance Monitor */}
          <div className="mt-6 pt-4 border-t border-neutral">
            <h3 className="title-md text-secondary font-normal mb-2">Thapar 75% Attendance Threshold Monitor</h3>
            <p className="body-sm text-secondary mb-3">Mandatory 75% attendance required to sit in Mid-Sem and End-Sem exams.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { course: 'UCS405 Operating Systems', att: 21, tot: 24 },
                { course: 'UCS414 Computer Networks', att: 18, tot: 24 }
              ].map((a, i) => {
                const pct = Math.round((a.att / a.tot) * 100);
                return (
                  <div key={i} className="p-3 bg-muted border border-neutral">
                    <div className="flex justify-between body-sm font-medium text-secondary">
                      <span>{a.course}</span>
                      <span className={pct >= 75 ? 'text-primary font-bold' : 'text-error font-bold'}>{pct}%</span>
                    </div>
                    <div className="w-full bg-neutral h-1.5 rounded-none mt-2">
                      <div className={`h-full ${pct >= 75 ? 'bg-primary' : 'bg-error'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="label-sm text-secondary/70 mt-1">{a.att} of {a.tot} classes attended</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Study Pomodoro Timer */}
        <div className="lg:col-span-5 card-academic p-6 flex flex-col items-center justify-center text-center border-t-2 border-t-tertiary">
          <div className="flex border border-neutral mb-4">
            <button onClick={() => { setPomodoroMode('focus'); setTimeLeft(25 * 60); setIsRunning(false); }} className={`px-4 py-1.5 text-xs uppercase font-normal border-none cursor-pointer ${pomodoroMode === 'focus' ? 'bg-tertiary text-white' : 'bg-surface text-secondary'}`}>Focus (25m)</button>
            <button onClick={() => { setPomodoroMode('break'); setTimeLeft(5 * 60); setIsRunning(false); }} className={`px-4 py-1.5 text-xs uppercase font-normal border-none cursor-pointer ${pomodoroMode === 'break' ? 'bg-tertiary text-white' : 'bg-surface text-secondary'}`}>Recess (5m)</button>
          </div>
          <div className="headline-display text-primary font-mono my-4">
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div className="body-sm text-secondary mb-4">Dedicated Academic Focus Timer</div>
          <div className="flex gap-3">
            <button onClick={() => setIsRunning(!isRunning)} className="btn-primary px-6 flex items-center gap-1.5">
              {isRunning ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Begin</>}
            </button>
            <button onClick={() => { setIsRunning(false); setTimeLeft(pomodoroMode === 'focus' ? 25 * 60 : 5 * 60); }} className="btn-secondary px-4 flex items-center gap-1.5">
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. ACADEMIC RESOURCES & PYQS VIEW
// ==========================================
function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = academicResources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Academic Resources & PYQs</h1>
        <p className="body-md text-secondary mt-0.5">Subject-wise lecture slides, previous year question banks (PYQs), lab manuals, and faculty notes.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search slides, PYQs, subjects (e.g. Operating Systems, Networks, Math)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-academic flex-1" />
        <div className="flex border border-neutral">
          {['ALL', 'Lecture Slides', 'PYQ Bank', 'Study Notes'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 text-xs uppercase font-normal border-none cursor-pointer ${filterType === t ? 'bg-tertiary text-white' : 'bg-surface text-secondary'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => (
          <div key={res.id} className="card-academic p-5 flex flex-col justify-between border-t-2 border-t-primary">
            <div>
              <div className="flex justify-between items-start">
                <span className="chip-academic-maroon text-[10px]">{res.type}</span>
                <span className="label-sm text-secondary/70">{res.size}</span>
              </div>
              <h3 className="title-md text-secondary font-normal mt-2 leading-snug">{res.title}</h3>
              <div className="body-sm text-primary font-medium mt-1">Course: {res.subject}</div>
              <div className="label-sm text-secondary/70 mt-0.5">Faculty Contributor: {res.author}</div>
            </div>
            <button onClick={() => alert(`Starting download for "${res.title}"`)} className="btn-secondary w-full justify-center mt-5 text-xs">
              Download Course Material (PDF)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. ACADEMIC CALENDAR VIEW
// ==========================================
function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Academic Calendar & Examination Schedule</h1>
        <p className="body-md text-secondary mt-0.5">Office of Dean Academic Affairs approved milestones, MST/EST dates, and university recesses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {academicCalendarEvents.map((ev) => (
          <div key={ev.id} className="card-academic p-5 flex flex-col justify-between border-l-2 border-l-primary">
            <div>
              <span className="chip-academic text-[10px] uppercase">{ev.type}</span>
              <h3 className="title-md text-primary font-normal mt-2">{ev.title}</h3>
              <div className="body-sm text-secondary mt-1 font-medium">{ev.date}</div>
              <div className="label-sm text-secondary/70 mt-0.5">Venue / Centers: {ev.venue}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral flex justify-between items-center">
              <span className="label-sm text-secondary/60">Academic Year 2026-27</span>
              <button onClick={() => alert(`Milestone "${ev.title}" saved to your calendar.`)} className="btn-tertiary text-xs">Save Milestone</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 11. MY REQUESTS & CONSULTATION DESK
// ==========================================
function RequestsPage() {
  const { requests, updateRequestStatus, user } = useApp();

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-neutral">
        <h1 className="headline-lg text-primary">Faculty Consultation Desk & Requests</h1>
        <p className="body-md text-secondary mt-0.5">Direct appointment booking records between enrolled students and department professors.</p>
      </div>

      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.id} className="card-academic p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="title-md text-primary font-normal">{r.topic}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral text-secondary'}`}>{r.status}</span>
              </div>
              <div className="body-sm text-secondary mt-1">
                Student: <span className="font-medium text-secondary">{r.studentName}</span> ({r.studentRoll}) • Faculty: <span className="font-medium text-primary">{r.professorName}</span> ({r.cabin})
              </div>
              <div className="label-sm text-secondary/70 mt-0.5">Scheduled Slot: {r.slot}</div>
            </div>

            {user?.role === 'professor' && r.status === 'Pending' && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => updateRequestStatus(r.id, 'Approved')} className="btn-primary text-xs">Approve</button>
                <button onClick={() => updateRequestStatus(r.id, 'Rescheduled')} className="btn-secondary text-xs">Reschedule</button>
              </div>
            )}
          </div>
        ))}
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
            {/* Root redirects to appropriate portal */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthGateway />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/auth/student-login" element={<StudentLogin />} />
            <Route path="/auth/student-signup" element={<StudentSignup />} />
            <Route path="/auth/professor-login" element={<ProfessorLogin />} />
            <Route path="/auth/professor-signup" element={<ProfessorSignup />} />

            {/* Academic & Overview Routes ONLY */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/classroom" element={<ClassroomFinder />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/professors" element={<ProfessorsDirectory />} />

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
