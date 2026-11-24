import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tiet_sync_academic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (token) {
        try {
          const me = await api.getMe();
          if (me) {
            setUser(me);
            localStorage.setItem('tiet_sync_academic_user', JSON.stringify(me));
          }
        } catch (err) {
          console.warn('Auto-login session expired:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('tiet_sync_academic_user');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    localStorage.setItem('tiet_sync_academic_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    localStorage.setItem('tiet_sync_academic_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tiet_sync_academic_user');
    }
  };

  const roleRedirect = (userObj) => {
    const role = (userObj?.role || '').toLowerCase();
    if (role === 'professor') return '/faculty/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, roleRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-secondary text-sm animate-pulse">Loading academic session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    // Redirect to user's rightful dashboard
    const role = user.role.toLowerCase();
    const destination = role === 'professor' ? '/faculty/dashboard' : role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}
