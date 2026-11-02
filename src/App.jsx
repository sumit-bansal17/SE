import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Bell, BookOpen, Briefcase, CalendarDays, ChartColumn, ClipboardList, Contact, DoorOpen,
  FileStack, GraduationCap, Headset, LayoutDashboard, LifeBuoy, MapPin, Map, Megaphone,
  Menu, MessageSquare, Moon, PackageSearch, Router, Search, Settings, ShieldCheck,
  ShoppingBag, ShoppingCart, Store, Sun, Trash2, UsersRound, Users, Wifi, X, Check,
  Clock, Plus, ArrowRight, Sparkles, Navigation, Send, Flame, Play, Pause, RotateCcw,
  CheckCircle, Tv, Wind, Compass, Phone, Ambulance, Star, RefreshCw, ZoomIn, ZoomOut,
  ChevronRight
} from 'lucide-react';

import {
  initialUser, sampleTimetable, initialTasks, initialNotifications,
  classroomsData, professorsData, marketplaceItems, lostFoundItems,
  societiesData, shopsData, wifiHotspots, campusSupportContacts
} from './data';

// ==========================================
// 1. APP CONTEXT & GLOBAL STATE
// ==========================================
const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('snaplocate_theme') || 'light');
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('snaplocate_user');
    return s ? JSON.parse(s) : initialUser;
  });
  const [timetable, setTimetable] = useState(sampleTimetable);
  const [tasks, setTasks] = useState(() => {
    const s = localStorage.getItem('snaplocate_tasks');
    return s ? JSON.parse(s) : initialTasks;
  });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [marketplace, setMarketplace] = useState(marketplaceItems);
  const [lostFound, setLostFound] = useState(lostFoundItems);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    theme === 'dark' ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('snaplocate_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('snaplocate_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTheme = () => setTheme((p) => (p === 'dark' ? 'light' : 'dark'));

  const switchRole = (newRole) => {
    const updated = {
      ...user,
      role: newRole,
      full_name: newRole === 'admin' ? 'Dr. Administrative Dean' : newRole === 'faculty' ? 'Dr. Rajesh Kumar' : 'Aarav Sharma',
      email: newRole === 'admin' ? 'admin@thapar.edu' : newRole === 'faculty' ? 'rkumar@thapar.edu' : 'asharma_be23@thapar.edu',
    };
    setUser(updated);
    localStorage.setItem('snaplocate_user', JSON.stringify(updated));
  };

  const toggleTask = (id) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t)));
  const addTask = (label, sub = 'Student task', category = 'General') => setTasks((p) => [{ id: `tsk-${Date.now()}`, label, sub, category, is_done: false }, ...p]);
  const deleteTask = (id) => setTasks((p) => p.filter((t) => t.id !== id));

  const markNotificationRead = (id) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  const markAllNotificationsRead = () => setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  const deleteNotification = (id) => setNotifications((p) => p.filter((n) => n.id !== id));

  const addMarketplaceItem = (item) => setMarketplace((p) => [{ ...item, id: `mkt-${Date.now()}`, date: 'Just now', seller: user.full_name }, ...p]);
  const addLostFoundItem = (item) => setLostFound((p) => [{ ...item, id: `lf-${Date.now()}`, date: 'Today' }, ...p]);
  const claimLostFoundItem = (id) => setLostFound((p) => p.map((it) => (it.id === id ? { ...it, status: 'Claimed' } : it)));

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, user, switchRole, timetable, tasks, toggleTask, addTask, deleteTask,
      notifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
      marketplace, addMarketplaceItem, lostFound, addLostFoundItem, claimLostFoundItem
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

// ==========================================
// 2. MAIN LAYOUT & NAVIGATION
// ==========================================
function PageLayout({ children }) {
  const { user, switchRole, theme, toggleTheme, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const initials = user?.full_name ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'ST';

  const navItems = [
    { section: 'Overview' },
    { label: user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'faculty' ? 'Faculty Portal' : 'Dashboard', path: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'faculty' ? '/faculty/dashboard' : '/dashboard', icon: LayoutDashboard },
    { section: 'Academic' },
    { label: 'Classroom', path: '/classroom', icon: DoorOpen },
    { label: 'Work-Space', path: '/workspace', icon: Briefcase },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Resources', path: '/resources', icon: FileStack },
    { label: 'Professor', path: '/professors', icon: Users },
    { section: 'Campus Life' },
    { label: 'Market-Place', path: '/marketplace', icon: ShoppingCart },
    { label: 'Lost & Found', path: '/lost-found', icon: Search },
    { label: 'Society', path: '/society', icon: UsersRound },
    { label: 'Shops', path: '/shops', icon: Store },
    { label: 'Wi-Fi', path: '/wifi', icon: Wifi },
    { label: 'Campus-Support', path: '/campus-support', icon: LifeBuoy },
    { label: 'Campus Map', path: '/campus-map', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-inter selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="sticky top-0 w-full h-[72px] flex items-center justify-between px-4 sm:px-7 bg-surface-card/95 backdrop-blur-md border-b border-ink-border z-50 transition-colors shadow-xs">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setMobileMenuOpen(true)} className="flex lg:hidden p-2 rounded-lg bg-transparent border-none cursor-pointer text-ink-secondary hover:bg-surface-muted">
            <Menu size={24} />
          </button>
          <div onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'faculty' ? '/faculty/dashboard' : '/dashboard')} className="flex items-center gap-2.5 cursor-pointer select-none group">
            <img src="/images/snaplocate-icon.svg" alt="SnapLocate" className="w-9 h-9 transition-transform group-hover:scale-105" />
            <div>
              <div className="font-jakarta text-[16px] font-extrabold text-ink leading-tight flex items-center gap-1.5">
                SnapLocate
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-light text-brand">TIET</span>
              </div>
              <div className="font-jakarta text-[10px] font-bold text-brand uppercase tracking-wider">{user?.role || 'STUDENT'} OS</div>
            </div>
          </div>
        </div>

        {/* Center Role Switcher */}
        <div className="hidden md:flex items-center bg-surface-muted rounded-full p-1 border border-ink-border text-xs font-jakarta font-bold">
          {['student', 'faculty', 'admin'].map((r) => (
            <button key={r} onClick={() => { switchRole(r); navigate(r === 'student' ? '/dashboard' : r === 'faculty' ? '/faculty/dashboard' : '/admin/dashboard'); }}
              className={`px-3 py-1 rounded-full border-none cursor-pointer capitalize transition-all ${user?.role === r ? 'bg-surface-card text-brand shadow-xs' : 'text-ink-secondary hover:text-ink'}`}>
              {r}
            </button>
          ))}
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="flex items-center p-2 rounded-xl bg-surface-muted hover:bg-brand-light hover:text-brand border border-ink-border cursor-pointer transition-colors text-ink-secondary">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative flex items-center p-2 rounded-xl bg-transparent border-none cursor-pointer hover:bg-surface-muted text-ink-secondary">
              <Bell size={20} className={notificationsOpen ? 'text-brand' : 'text-ink-secondary'} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-surface-card">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="fixed sm:absolute top-[72px] sm:top-12 left-2 right-2 sm:left-auto sm:right-0 sm:w-[340px] bg-surface-card border border-ink-border rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-ink-border bg-surface-muted/50">
                  <span className="font-jakarta text-xs font-bold text-ink">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && <button onClick={markAllNotificationsRead} className="bg-transparent border-none text-xs font-semibold text-brand cursor-pointer hover:underline">Mark all read</button>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-ink-divider">
                  {notifications.map((n) => (
                    <div key={n.id} onClick={() => { markNotificationRead(n.id); navigate(n.link || '/dashboard'); setNotificationsOpen(false); }} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-surface-muted ${n.is_read ? 'opacity-70' : 'bg-brand-light/30'}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-brand'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-jakarta text-xs font-bold text-ink truncate">{n.title}</div>
                        <div className="text-[11px] text-ink-secondary mt-0.5 line-clamp-2">{n.message}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="text-ink-subtle hover:text-red-500 bg-transparent border-none p-1 cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-7 bg-ink-border shrink-0" />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand/20 hover:border-brand cursor-pointer p-0 bg-brand-light flex items-center justify-center transition-all shadow-xs">
              {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="font-jakarta text-xs font-bold text-brand">{initials}</span>}
            </button>
            {profileDropdownOpen && (
              <div className="absolute top-12 right-0 bg-surface-card border border-ink-border rounded-2xl shadow-xl min-w-[200px] z-50 p-1.5">
                <div className="px-3 py-2 border-b border-ink-border">
                  <div className="font-jakarta text-xs font-bold text-ink">{user?.full_name}</div>
                  <div className="text-[11px] text-ink-secondary truncate">{user?.email}</div>
                </div>
                <button onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }} className="w-full px-3 py-2 text-left text-xs font-medium text-ink bg-transparent border-none rounded-xl hover:bg-surface-muted cursor-pointer flex items-center gap-2"><Settings size={14} /> Settings</button>
                <button onClick={() => { setProfileDropdownOpen(false); navigate('/campus-support'); }} className="w-full px-3 py-2 text-left text-xs font-medium text-ink bg-transparent border-none rounded-xl hover:bg-surface-muted cursor-pointer flex items-center gap-2"><Headset size={14} /> Support</button>
                <div className="h-px bg-ink-border my-1" />
                <button onClick={() => { switchRole('student'); navigate('/dashboard'); setProfileDropdownOpen(false); }} className="w-full px-3 py-1.5 text-left text-[11px] text-ink-secondary hover:text-brand bg-transparent border-none rounded-lg cursor-pointer">Student View</button>
                <button onClick={() => { switchRole('faculty'); navigate('/faculty/dashboard'); setProfileDropdownOpen(false); }} className="w-full px-3 py-1.5 text-left text-[11px] text-ink-secondary hover:text-brand bg-transparent border-none rounded-lg cursor-pointer">Faculty View</button>
                <button onClick={() => { switchRole('admin'); navigate('/admin/dashboard'); setProfileDropdownOpen(false); }} className="w-full px-3 py-1.5 text-left text-[11px] text-ink-secondary hover:text-brand bg-transparent border-none rounded-lg cursor-pointer">Admin View</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        <aside className="hidden lg:block w-[240px] shrink-0 border-r border-ink-border py-6 px-4 bg-surface sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navItems.map((item, idx) => {
              if (item.section) return <div key={idx} className="font-jakarta text-[11px] font-bold uppercase tracking-wider text-ink-subtle px-3 pt-4 pb-1">{item.section}</div>;
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/dashboard'} className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-jakarta transition-all no-underline ${isActive ? 'bg-brand/10 text-brand font-bold shadow-xs' : 'text-ink-secondary font-medium hover:bg-surface-muted hover:text-ink'}`}>
                  {({ isActive }) => (<><Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-brand' : 'text-ink-secondary'} /><span>{item.label}</span></>)}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
            <div className="relative w-[280px] bg-surface-card h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center pb-3 border-b border-ink-border">
                <div className="flex items-center gap-2"><img src="/images/snaplocate-icon.svg" alt="" className="w-7 h-7" /><span className="font-jakarta font-extrabold text-sm">SnapLocate</span></div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-ink-secondary bg-transparent border-none"><X size={18} /></button>
              </div>
              {navItems.map((item, idx) => {
                if (item.section) return <div key={idx} className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle px-2 pt-3">{item.section}</div>;
                const Icon = item.icon;
                return (
                  <NavLink key={`m-${item.path}`} to={item.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-jakarta text-ink-secondary hover:bg-surface-muted no-underline">
                    <Icon size={16} /><span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// ==========================================
// 3. STUDENT DASHBOARD VIEW
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="t-heading-3xl t-primary">{greeting}, {firstName} 👋</h1>
          <p className="t-xl t-secondary mt-0.5">Here is what is happening on campus today.</p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <div className="bg-surface-muted border border-ink-border rounded-2xl px-3.5 py-1.5 text-xs font-semibold text-ink">
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="bg-surface-muted border border-ink-border rounded-2xl px-3.5 py-1.5 text-xs font-semibold text-ink flex items-center gap-1.5">
            <Clock size={14} className="text-brand" />
            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Row 1: Next Class Hero Card + Tasks Hub */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
        {/* Next Class Hero Card */}
        <div className="flex-1 relative overflow-hidden card p-6 min-h-[190px] flex flex-col justify-between">
          <img src="/images/img_overlay.png" alt="" className="hidden sm:block absolute top-0 right-0 w-32 h-32 pointer-events-none rounded-tr-3xl opacity-80" />
          {activeClass ? (
            <div className="relative z-10 flex flex-col gap-4 flex-1 justify-between">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center bg-brand-light rounded-xl px-3 py-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${activeClass.status === 'ongoing' ? 'bg-emerald-500 animate-pulse' : 'bg-brand'}`} />
                  <span className={`text-xs font-bold uppercase ${activeClass.status === 'ongoing' ? 'text-emerald-700' : 'text-brand'}`}>
                    {activeClass.status === 'ongoing' ? 'In Progress' : 'Up Next'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-surface-muted text-ink-secondary">{activeClass.day}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex flex-col gap-0.5 sm:w-[50%]">
                  <div className="font-jakarta text-[38px] font-extrabold leading-none text-ink">{activeClass.time_slot}</div>
                  <h2 className="t-heading-xl t-primary truncate mt-1">{activeClass.course}</h2>
                  <p className="t-md t-secondary">{activeClass.type} • {activeClass.instructor}</p>
                </div>
                <div onClick={() => navigate('/classroom', { state: { search: activeClass.location } })} className="flex gap-3 items-center bg-surface-muted hover:bg-brand-light/50 border border-ink-border rounded-2xl p-3.5 flex-1 cursor-pointer transition-all group shadow-xs">
                  <div className="w-10 h-10 bg-surface-card rounded-2xl shadow-xs flex items-center justify-center p-2.5 shrink-0">
                    <img src="/images/img_background_shadow.svg" alt="" className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-ink-secondary uppercase">Location</div>
                    <div className="font-jakarta font-bold text-sm text-ink group-hover:text-brand truncate">{activeClass.location}</div>
                  </div>
                  <img src="/images/img_arrow_right.svg" alt="" className="w-4 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-ink-subtle text-sm font-semibold">No more classes scheduled today! Catch up on rest 💤</div>
          )}
        </div>

        {/* Tasks Hub */}
        <div className="w-full lg:w-[340px] shrink-0 card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="t-heading-lg t-primary">Tasks Hub</span>
              <button onClick={() => navigate('/workspace')} className="text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex gap-2.5 items-start">
                  <div onClick={() => toggleTask(task.id)} className={`w-4 h-4 rounded mt-0.5 cursor-pointer flex items-center justify-center border-2 transition-all ${task.is_done ? 'bg-brand border-brand' : 'border-brand/60 bg-transparent'}`}>
                    {task.is_done && <Check size={11} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${task.is_done ? 'line-through text-ink-subtle' : 'text-ink'}`}>{task.label}</div>
                    <div className="text-[11px] text-ink-secondary truncate">{task.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (taskInput.trim()) { addTask(taskInput.trim()); setTaskInput(''); } }} className="mt-4 pt-3 border-t border-ink-border flex gap-2">
            <input type="text" placeholder="Add quick task..." value={taskInput} onChange={(e) => setTaskInput(e.target.value)} className="flex-1 bg-surface-muted text-ink text-xs px-3 py-1.5 rounded-xl border border-ink-border focus:outline-none focus:border-brand" />
            <button type="submit" className="p-1.5 bg-brand text-white rounded-xl border-none cursor-pointer"><Plus size={15} /></button>
          </form>
        </div>
      </div>

      {/* Row 2: Schedule & Activity */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
        {/* Schedule */}
        <div className="flex-1 card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="t-heading-lg t-primary">{scheduleView === 'day' ? "Today's Schedule" : 'Weekly Overview'}</span>
            <div className="flex items-center bg-surface-muted rounded-xl p-1 border border-ink-border">
              {['day', 'week'].map((v) => (
                <button key={v} onClick={() => setScheduleView(v)} className={`text-xs px-3 py-1 rounded-lg border-none cursor-pointer capitalize font-bold ${scheduleView === v ? 'bg-surface-card text-brand shadow-xs' : 'bg-transparent text-ink-secondary'}`}>{v}</button>
              ))}
            </div>
          </div>

          {scheduleView === 'day' ? (
            <div className="flex flex-col gap-4 mt-2">
              {todayClasses.map((c, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
                  <div className="flex-1 p-3.5 bg-surface-muted rounded-2xl border border-ink-border flex justify-between items-center">
                    <div>
                      <div className="font-jakarta font-bold text-sm text-ink">{c.course}</div>
                      <div className="text-xs text-ink-secondary mt-0.5">{c.location} • {c.time_slot}</div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-surface-card text-brand">{c.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => (
                <div key={day} className="bg-surface-muted p-3.5 rounded-2xl border border-ink-border">
                  <div className="text-[11px] font-bold text-ink uppercase mb-2">{day}</div>
                  <div className="flex flex-col gap-2">
                    {timetable.filter((t) => t.day === day).map((t, idx) => (
                      <div key={idx} className="bg-surface-card p-2 rounded-xl border border-ink-border text-xs">
                        <div className="font-bold text-brand truncate">{t.course.split(':')[0]}</div>
                        <div className="text-ink-secondary text-[11px] mt-0.5">{t.time_slot}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="w-full lg:w-[340px] shrink-0 card p-6 flex flex-col justify-between">
          <div>
            <h3 className="t-heading-lg t-primary mb-4">Recent Activity</h3>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0"><Sparkles size={16} /></div>
                <div><span className="font-bold text-ink">Mid-Sem Datesheet</span><div className="text-[11px] text-ink-subtle">Released by Dean Academic</div></div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><ShoppingBag size={16} /></div>
                <div><span className="font-bold text-ink">Marketplace Deal</span><div className="text-[11px] text-ink-subtle">Hero Sprint cycle listed</div></div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Search size={16} /></div>
                <div><span className="font-bold text-ink">Lost & Found Alert</span><div className="text-[11px] text-ink-subtle">Student ID logged at Gate 1</div></div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/workspace')} className="w-full pt-3 text-center border-t border-ink-border text-xs font-bold text-brand bg-transparent border-none cursor-pointer">Open Study Workspace →</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CLASSROOM FINDER VIEW
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="t-heading-3xl t-primary">Classroom & Hall Locator 📍</h1>
        <p className="t-xl t-secondary mt-1">Instant room codes, floorplans, and cabin directions across TIET campus.</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3.5 text-ink-secondary" />
        <input type="text" placeholder="Search by room code (e.g. LT 101, LP 104, CS Lab 3, Block B)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-card pl-10 pr-4 py-3 rounded-2xl border border-ink-border text-ink text-sm font-medium focus:outline-none focus:border-brand shadow-xs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setSelectedClass(c)} className={`card p-4 cursor-pointer transition-all border ${selectedClass?.id === c.id ? 'border-brand bg-brand-light/30' : 'hover:border-brand/40'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-jakarta text-base font-bold text-ink">{c.code}</div>
                  <div className="text-xs text-ink-secondary mt-0.5">{c.name}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand">{c.floor}</span>
              </div>
              <div className="text-xs text-ink-secondary mt-2 pt-2 border-t border-ink-divider flex items-center gap-2">
                <MapPin size={13} className="text-brand" /> {c.block} • {c.capacity} seats
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {selectedClass && (
            <div className="card p-6 flex flex-col gap-5 sticky top-24">
              <div className="flex justify-between items-center pb-4 border-b border-ink-border">
                <div>
                  <h2 className="t-heading-2xl t-primary">{selectedClass.code}</h2>
                  <p className="text-xs text-ink-secondary mt-0.5">{selectedClass.name}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Open for Lectures</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-surface-muted p-3 rounded-xl border border-ink-border"><span className="text-ink-subtle block">Building</span><span className="font-bold text-ink mt-0.5 block">{selectedClass.block}</span></div>
                <div className="bg-surface-muted p-3 rounded-xl border border-ink-border"><span className="text-ink-subtle block">Floor</span><span className="font-bold text-ink mt-0.5 block">{selectedClass.floor}</span></div>
                <div className="bg-surface-muted p-3 rounded-xl border border-ink-border"><span className="text-ink-subtle block">Capacity</span><span className="font-bold text-ink mt-0.5 block">{selectedClass.capacity} Students</span></div>
              </div>

              <div className="bg-brand-light/40 border border-brand/20 rounded-2xl p-4">
                <div className="font-jakarta font-bold text-xs text-brand mb-1 flex items-center gap-1.5"><Navigation size={14} /> Wayfinding Directions</div>
                <p className="text-xs text-ink leading-relaxed">{selectedClass.directions}</p>
              </div>

              <div className="p-8 border border-ink-border rounded-2xl bg-surface-muted flex flex-col items-center justify-center text-center">
                <DoorOpen size={36} className="text-brand mb-2" />
                <div className="font-jakarta font-bold text-xs text-ink">Floorplan: {selectedClass.block} ({selectedClass.floor})</div>
                <p className="text-[11px] text-ink-secondary mt-1">Staircase & elevator ramp accessible via central foyer.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. PROFESSORS DIRECTORY VIEW
// ==========================================
function ProfessorsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingProf, setBookingProf] = useState(null);
  const [booked, setBooked] = useState(false);

  const filtered = professorsData.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cabin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.research.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="t-heading-3xl t-primary">Faculty Directory & Cabins 👨‍🏫</h1>
        <p className="t-xl t-secondary mt-1">Locate professor cabins, view consultation office hours, and book meetings.</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3.5 text-ink-secondary" />
        <input type="text" placeholder="Search by faculty name, cabin, research topic..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-card pl-10 pr-4 py-3 rounded-2xl border border-ink-border text-ink text-sm font-medium focus:outline-none focus:border-brand shadow-xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((prof) => (
          <div key={prof.id} className="card p-5 flex flex-col justify-between hover:border-brand/40 transition-all">
            <div>
              <div className="flex items-start gap-3.5">
                <img src={prof.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover border border-brand/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-jakarta font-bold text-base text-ink truncate">{prof.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${prof.available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <div className="text-xs text-ink-secondary">{prof.designation}</div>
                  <div className="text-xs font-bold text-brand mt-0.5">{prof.department}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 text-xs">
                <div className="bg-surface-muted p-2 rounded-xl border border-ink-border font-medium text-ink"><MapPin size={13} className="text-brand inline mr-1.5" />Cabin: {prof.cabin}</div>
                <div className="text-ink-secondary px-1"><Clock size={13} className="text-brand inline mr-1.5" />Hours: {prof.officeHours}</div>
                <div className="text-ink-secondary px-1 truncate"><a href={`mailto:${prof.email}`} className="text-brand hover:underline">{prof.email}</a></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ink-border flex gap-2">
              <button onClick={() => setBookingProf(prof)} className="flex-1 py-2 bg-brand text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-brand-hover">Book Appointment</button>
              <a href={`mailto:${prof.email}`} className="py-2 px-3 bg-surface-muted text-ink rounded-xl text-xs font-bold border border-ink-border text-decoration-none">Email</a>
            </div>
          </div>
        ))}
      </div>

      {bookingProf && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-md rounded-3xl p-6 border border-ink-border shadow-xl">
            {booked ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle size={40} className="text-emerald-500" />
                <h3 className="font-bold text-ink">Appointment Request Sent!</h3>
                <p className="text-xs text-ink-secondary">Professor will receive your meeting slot via university email.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setBooked(true); setTimeout(() => { setBooked(false); setBookingProf(null); }, 1500); }} className="flex flex-col gap-3 text-xs">
                <h3 className="font-jakarta font-bold text-base text-ink">Book Meeting with {bookingProf.name}</h3>
                <input type="datetime-local" required className="bg-surface-muted p-2.5 rounded-xl border border-ink-border text-ink" />
                <textarea rows={3} required placeholder="Reason for consultation..." className="bg-surface-muted p-2.5 rounded-xl border border-ink-border text-ink" />
                <div className="flex gap-2 justify-end mt-2">
                  <button type="button" onClick={() => setBookingProf(null)} className="px-3 py-1.5 bg-surface-muted rounded-xl border border-ink-border cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-brand text-white rounded-xl font-bold border-none cursor-pointer">Confirm</button>
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
// 6. WORKSPACE & POMODORO VIEW
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="t-heading-3xl t-primary">Study Workspace & Tasks ⚡</h1>
        <p className="t-xl t-secondary mt-1">Deep focus timer, attendance criteria tracker, and assignment checklist.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Board */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="t-heading-lg t-primary">Assignment & Task Checklist</h2>
            <form onSubmit={(e) => { e.preventDefault(); if (taskText.trim()) { addTask(taskText.trim()); setTaskText(''); } }} className="flex gap-2">
              <input type="text" placeholder="Add study task..." value={taskText} onChange={(e) => setTaskText(e.target.value)} className="flex-1 bg-surface-muted text-ink text-xs px-3.5 py-2.5 rounded-xl border border-ink-border focus:outline-none focus:border-brand" />
              <button type="submit" className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1"><Plus size={15} /> Add</button>
            </form>
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 bg-surface-muted rounded-xl border border-ink-border flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div onClick={() => toggleTask(task.id)} className={`w-4 h-4 rounded cursor-pointer flex items-center justify-center border-2 ${task.is_done ? 'bg-brand border-brand' : 'border-brand/60 bg-transparent'}`}>
                      {task.is_done && <Check size={11} className="text-white" />}
                    </div>
                    <span className={task.is_done ? 'line-through text-ink-subtle' : 'font-semibold text-ink'}>{task.label}</span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-ink-subtle hover:text-red-500 bg-transparent border-none cursor-pointer p-1"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Tracker */}
          <div className="card p-6 flex flex-col gap-3">
            <h3 className="t-heading-lg t-primary">Attendance Monitor (75% Criteria)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[{ course: 'UCS405 Operating Systems', att: 21, tot: 24 }, { course: 'UCS414 Computer Networks', att: 18, tot: 24 }].map((a, i) => {
                const pct = Math.round((a.att / a.tot) * 100);
                return (
                  <div key={i} className="p-3.5 bg-surface-muted rounded-xl border border-ink-border flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold text-ink"><span>{a.course}</span><span className={pct >= 75 ? 'text-emerald-600' : 'text-red-500'}>{pct}%</span></div>
                    <div className="w-full bg-surface-card h-1.5 rounded-full overflow-hidden border border-ink-border">
                      <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="lg:col-span-5 card p-6 flex flex-col items-center justify-center text-center">
          <div className="flex gap-2 p-1 bg-surface-muted rounded-xl mb-4 text-xs font-bold">
            <button onClick={() => { setPomodoroMode('focus'); setTimeLeft(25 * 60); setIsRunning(false); }} className={`px-3 py-1 rounded-lg border-none cursor-pointer ${pomodoroMode === 'focus' ? 'bg-brand text-white' : 'bg-transparent text-ink-secondary'}`}>Focus (25m)</button>
            <button onClick={() => { setPomodoroMode('break'); setTimeLeft(5 * 60); setIsRunning(false); }} className={`px-3 py-1 rounded-lg border-none cursor-pointer ${pomodoroMode === 'break' ? 'bg-brand text-white' : 'bg-transparent text-ink-secondary'}`}>Break (5m)</button>
          </div>
          <div className="font-mono text-5xl font-extrabold text-ink my-3">
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setIsRunning(!isRunning)} className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center border-none cursor-pointer shadow-md">
              {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button onClick={() => { setIsRunning(false); setTimeLeft(pomodoroMode === 'focus' ? 25 * 60 : 5 * 60); }} className="w-12 h-12 rounded-full bg-surface-muted text-ink flex items-center justify-center border border-ink-border cursor-pointer">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. MARKETPLACE VIEW
// ==========================================
function MarketplacePage() {
  const { marketplace, addMarketplaceItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(['Hi! Is this item still available?']);

  // New item form
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const filtered = marketplace.filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="t-heading-3xl t-primary">Campus Marketplace 🛍️</h1>
          <p className="t-xl t-secondary mt-1">Buy & sell textbooks, calculators, and bicycles verified within TIET.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-brand text-white rounded-xl text-xs font-bold border-none cursor-pointer flex items-center gap-1.5"><Plus size={15} /> Sell Item</button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3.5 text-ink-secondary" />
        <input type="text" placeholder="Search marketplace items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-surface-card pl-10 pr-4 py-3 rounded-2xl border border-ink-border text-ink text-sm font-medium focus:outline-none focus:border-brand shadow-xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((item) => (
          <div key={item.id} className="card overflow-hidden flex flex-col justify-between hover:border-brand/40 transition-all">
            <div className="h-44 bg-surface-muted relative">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 bg-surface-card px-2 py-0.5 rounded-lg text-xs font-bold text-ink border border-ink-border">₹{item.price}</span>
            </div>
            <div className="p-4 flex flex-col gap-1.5">
              <h3 className="font-jakarta font-bold text-sm text-ink truncate">{item.title}</h3>
              <p className="text-xs text-ink-secondary line-clamp-2">{item.description}</p>
              <div className="text-[11px] text-ink-subtle mt-1">{item.seller} • {item.date}</div>
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => setActiveChat(item)} className="w-full py-2 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-colors">Chat with Seller</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={(e) => { e.preventDefault(); if (title && price) { addMarketplaceItem({ title, price: Number(price), description: 'Verified campus listing', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80' }); setShowModal(false); } }} className="bg-surface-card w-full max-w-md rounded-3xl p-6 border border-ink-border flex flex-col gap-3 text-xs">
            <h3 className="font-jakarta font-bold text-base text-ink">List Item for Sale</h3>
            <input type="text" required placeholder="Item Title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface-muted p-2.5 rounded-xl border border-ink-border text-ink" />
            <input type="number" required placeholder="Price in ₹..." value={price} onChange={(e) => setPrice(e.target.value)} className="bg-surface-muted p-2.5 rounded-xl border border-ink-border text-ink" />
            <div className="flex gap-2 justify-end mt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-surface-muted rounded-xl border border-ink-border cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-brand text-white rounded-xl font-bold border-none cursor-pointer">Publish</button>
            </div>
          </form>
        </div>
      )}

      {activeChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-md h-[450px] rounded-3xl border border-ink-border shadow-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-ink-border flex justify-between items-center bg-surface-muted">
              <span className="font-jakarta font-bold text-xs text-ink truncate">{activeChat.title} (Seller: {activeChat.seller})</span>
              <button onClick={() => setActiveChat(null)} className="p-1 bg-transparent border-none cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 text-xs">
              {messages.map((m, i) => (
                <div key={i} className="self-end bg-brand text-white px-3 py-1.5 rounded-xl max-w-[80%]">{m}</div>
              ))}
            </div>
            <div className="p-2 border-t border-ink-border flex gap-1.5">
              <input type="text" placeholder="Message seller..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && chatInput.trim()) { setMessages([...messages, chatInput.trim()]); setChatInput(''); } }} className="flex-1 bg-surface-muted p-2 rounded-xl border border-ink-border text-xs text-ink" />
              <button onClick={() => { if (chatInput.trim()) { setMessages([...messages, chatInput.trim()]); setChatInput(''); } }} className="px-3 bg-brand text-white rounded-xl border-none cursor-pointer"><Send size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. LOST & FOUND VIEW
// ==========================================
function LostFoundPage() {
  const { lostFound, addLostFoundItem, claimLostFoundItem } = useApp();
  const [tab, setTab] = useState('ALL');

  const filtered = lostFound.filter((it) => tab === 'ALL' || it.type === tab);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="t-heading-3xl t-primary">Lost & Found Hub 🔎</h1>
        <p className="t-xl t-secondary mt-1">Recover lost ID cards, keys, water bottles, and electronics.</p>
      </div>

      <div className="flex gap-2">
        {['ALL', 'found', 'lost'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize border cursor-pointer ${tab === t ? 'bg-brand text-white border-brand' : 'bg-surface-card text-ink-secondary border-ink-border'}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div key={item.id} className="card p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${item.type === 'found' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.type}</span>
                <span className="text-[10px] text-ink-subtle">{item.status}</span>
              </div>
              <h3 className="font-jakarta font-bold text-sm text-ink">{item.title}</h3>
              <p className="text-xs text-ink-secondary mt-1"><MapPin size={12} className="inline text-brand mr-1" />{item.location}</p>
              <div className="bg-surface-muted p-2 rounded-xl text-xs text-ink mt-3 border border-ink-border">{item.contact}</div>
            </div>
            {item.status !== 'Claimed' && item.type === 'found' && (
              <button onClick={() => claimLostFoundItem(item.id)} className="mt-3 w-full py-2 bg-brand text-white rounded-xl text-xs font-bold border-none cursor-pointer">Claim Item</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 9. OTHER CAMPUS SERVICES (SHOPS, WIFI, MAP, CALENDAR, SETTINGS)
// ==========================================
function ShopsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Campus Shops & Eateries 🍔</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shopsData.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start font-jakarta font-bold text-sm text-ink"><span>{s.name}</span><span className="text-amber-500">★ {s.rating}</span></div>
              <div className="text-xs text-ink-secondary mt-2"><Clock size={12} className="inline mr-1 text-brand" />{s.timing}</div>
              <div className="text-xs text-ink-secondary mt-1"><MapPin size={12} className="inline mr-1 text-brand" />{s.location}</div>
              <div className="flex flex-wrap gap-1 mt-3">{s.items.map((it, i) => (<span key={i} className="text-[11px] bg-surface-muted px-2 py-0.5 rounded-md border border-ink-border">{it}</span>))}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-ink-border flex justify-between items-center text-xs">
              <span className="text-emerald-600 font-bold">{s.delivery ? 'Hostel delivery available' : 'Walk-in'}</span>
              <a href={`tel:${s.contact}`} className="px-3 py-1 bg-brand text-white rounded-lg font-bold text-decoration-none">Call</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WiFiPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Campus Wi-Fi & Hotspots 📶</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wifiHotspots.map((w, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between text-xs font-bold"><span>{w.name}</span><span className="text-emerald-600">{w.status}</span></div>
            <div className="text-xl font-extrabold text-brand mt-2">{w.speed}</div>
            <div className="text-[11px] text-ink-subtle mt-1">Signal: {w.signal} • {w.ssid}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampusMapPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Campus Map & Landmarks 🗺️</h1>
      <div className="card p-8 bg-slate-900 border border-slate-800 text-slate-200 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <MapPin size={48} className="text-brand mb-2 animate-bounce" />
        <h2 className="font-jakarta font-extrabold text-xl text-white">Interactive 2D Campus Navigator</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md">Access coordinates, routes between Block B, Lecture Pavilion, Library, and residential hostels.</p>
      </div>
    </div>
  );
}

function SocietyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Student Societies & Clubs 🚀</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {societiesData.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1">{s.logo}</div>
              <h3 className="font-jakarta font-bold text-base text-ink">{s.name}</h3>
              <p className="text-xs text-ink-secondary mt-1">{s.description}</p>
            </div>
            <button onClick={() => alert(`Registration info for ${s.name} sent.`)} className="mt-4 py-2 bg-brand text-white rounded-xl text-xs font-bold border-none cursor-pointer">Join Club</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampusSupportPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Campus Emergency & Support 🛡️</h1>
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex justify-between items-center">
        <div><div className="font-bold text-red-600">Health Centre & Ambulance 24/7 Hotline</div><div className="text-xs text-ink-secondary">Doctor on call round-the-clock.</div></div>
        <a href="tel:+911752393333" className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold text-decoration-none">Call +91 175 239 3333</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campusSupportContacts.map((c, i) => (
          <div key={i} className="card p-4 flex justify-between items-center text-xs">
            <div><div className="font-bold text-ink">{c.title}</div><div className="text-ink-secondary mt-0.5">{c.desc}</div></div>
            <a href={`tel:${c.phone}`} className="px-3 py-1.5 bg-surface-muted rounded-xl border border-ink-border font-bold text-decoration-none text-ink">Call</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Academic Calendar & Events 📅</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Mid-Semester Tests (MST)', date: 'Nov 10 - Nov 16, 2026', type: 'Exam' },
          { title: 'HackTU 6.0 Hackathon', date: 'Nov 20 - Nov 22, 2026', type: 'Event' },
          { title: 'End-Semester Theory & Lab Exams', date: 'Dec 15 - Dec 29, 2026', type: 'Exam' }
        ].map((ev, i) => (
          <div key={i} className="card p-4 text-xs">
            <span className="font-bold text-brand uppercase">{ev.type}</span>
            <h3 className="font-jakarta font-bold text-sm text-ink mt-1">{ev.title}</h3>
            <div className="text-ink-secondary mt-1">{ev.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Academic Resources & PYQs 📚</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {[
          { title: 'UCS405 Operating Systems Complete Slides', sub: 'Operating Systems' },
          { title: 'UCS414 Computer Networks Tanenbaum Handout', sub: 'Networks' },
          { title: 'UMA010 Mathematics-II Formula Handbook', sub: 'Mathematics' }
        ].map((r, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between">
            <div><div className="font-bold text-ink">{r.title}</div><div className="text-ink-secondary mt-1">{r.sub}</div></div>
            <button onClick={() => alert(`Downloading ${r.title}`)} className="mt-3 py-1.5 bg-brand text-white rounded-lg border-none cursor-pointer font-bold">Download PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { user, switchRole, theme, toggleTheme } = useApp();
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto text-xs">
      <h1 className="t-heading-3xl t-primary">Settings & Preferences ⚙️</h1>
      <div className="card p-6 flex flex-col gap-4">
        <h2 className="font-bold text-base text-ink">Verified Identity</h2>
        <div><label className="text-ink-subtle uppercase">Name</label><div className="font-bold text-ink mt-0.5">{user?.full_name}</div></div>
        <div><label className="text-ink-subtle uppercase">Email</label><div className="font-bold text-ink mt-0.5">{user?.email}</div></div>
        <div><label className="text-ink-subtle uppercase">Switch System Role</label>
          <div className="flex gap-2 mt-1">
            {['student', 'faculty', 'admin'].map((r) => (
              <button key={r} onClick={() => switchRole(r)} className={`px-4 py-2 rounded-xl capitalize font-bold border cursor-pointer ${user?.role === r ? 'bg-brand text-white border-brand' : 'bg-surface-muted text-ink border-ink-border'}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-ink-border flex justify-between items-center">
          <div><div className="font-bold text-ink">Dark Theme</div><div className="text-ink-secondary">High-contrast night palette</div></div>
          <button onClick={toggleTheme} className="px-4 py-1.5 bg-surface-muted rounded-xl border border-ink-border font-bold text-ink cursor-pointer">{theme === 'dark' ? 'Dark Active' : 'Light Active'}</button>
        </div>
      </div>
    </div>
  );
}

function FacultyDashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">Faculty Teaching Portal 🎓</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="t-heading-lg t-primary mb-3">Lectures for Today</h2>
          <div className="p-3 bg-surface-muted rounded-xl border border-ink-border text-xs">
            <div className="font-bold text-ink">UCS405: Operating Systems (08:50 AM - 09:40 AM)</div>
            <div className="text-ink-secondary mt-0.5">LT 101 (Block B) • 142 students</div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="t-heading-lg t-primary mb-3">Cabin Consultation Hours</h2>
          <div className="text-xs text-ink">Available Mon & Wed 03:00 PM - 05:00 PM in Cabin C-314.</div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <h1 className="t-heading-3xl t-primary">University Admin Console 🛡️</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ l: 'Students', v: '11,480' }, { l: 'Faculty', v: '482' }, { l: 'Marketplace', v: '1,290' }, { l: 'Uptime', v: '99.98%' }].map((s, i) => (
          <div key={i} className="card p-4 text-xs"><div className="text-ink-subtle">{s.l}</div><div className="font-jakarta text-2xl font-extrabold text-ink mt-1">{s.v}</div></div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. ROOT APP WITH ROUTING
// ==========================================
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/classroom" element={<ClassroomFinder />} />
            <Route path="/professors" element={<ProfessorsDirectory />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/requests" element={<WorkspacePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/lost-found" element={<LostFoundPage />} />
            <Route path="/society" element={<SocietyPage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/wifi" element={<WiFiPage />} />
            <Route path="/campus-support" element={<CampusSupportPage />} />
            <Route path="/campus-map" element={<CampusMapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
