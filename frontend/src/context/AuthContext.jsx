import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'STUDENT' | 'CLUB_HEAD' | 'FACULTY'
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data);
      setRole(res.data.data?.role);
      
      if (res.data.data?.role === 'STUDENT') {
        try {
          const { studentAPI } = await import('../services/api');
          const eventsRes = await studentAPI.getMyEvents(res.data.data.id);
          if (eventsRes && eventsRes.data) {
            setRegisteredEventIds(eventsRes.data.map(e => String(e.id)));
          }
        } catch(e) { console.error("Error fetching registered events", e); }
      }
    } catch (err) {
      console.error("loadUser error", err);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token: jwt, user: userData } = res.data.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('userId', userData.id);
    setToken(jwt);
    setUser(userData);
    setRole(userData.role);

    if (userData.role === 'STUDENT') {
      try {
        const { studentAPI } = await import('../services/api');
        const eventsRes = await studentAPI.getMyEvents(userData.id);
        if (eventsRes && eventsRes.data) {
          setRegisteredEventIds(eventsRes.data.map(e => String(e.id)));
        }
      } catch(e) { console.error("Error fetching registered events during login", e); }
    }

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    setRole(null);
    setRegisteredEventIds([]);
    window.location.href = '/login';
  };

  const addRegisteredEventId = (id) => {
    setRegisteredEventIds(prev => {
      const strId = String(id);
      if (prev.includes(strId)) return prev;
      return [...prev, strId];
    });
  };

  const value = { 
    user, 
    role, 
    token, 
    loading, 
    login, 
    logout, 
    isAuthenticated: !!token, 
    registeredEventIds, 
    addRegisteredEventId 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
