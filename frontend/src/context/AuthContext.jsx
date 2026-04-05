import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'STUDENT' | 'CLUB_HEAD' | 'FACULTY'
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getProfile();
      setUser(res.data.data);
      setRole(res.data.data?.role);
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
    setToken(jwt);
    setUser(userData);
    setRole(userData.role);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
    window.location.href = '/login';
  };

  const value = { user, role, token, loading, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
