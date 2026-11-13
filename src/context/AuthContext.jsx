import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  const save = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Validate the stored token once on load (also picks up blocked accounts / role changes)
  useEffect(() => {
    if (!localStorage.getItem('token')) { setReady(true); return; }
    api.get('/api/auth/me')
      .then((r) => { localStorage.setItem('user', JSON.stringify(r.data)); setUser(r.data); })
      .catch(() => logout())
      .finally(() => setReady(true));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const refresh = useCallback(async () => {
    const r = await api.get('/api/auth/me');
    localStorage.setItem('user', JSON.stringify(r.data));
    setUser(r.data);
  }, []);

  const login = async (email, password) => save((await api.post('/api/auth/login', { email, password })).data);
  const register = async (payload) => save((await api.post('/api/auth/register', payload)).data);

  const value = useMemo(() => ({ user, ready, login, register, logout, refresh }), [user, ready, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const homeFor = (user) => (user?.role === 'ADMIN' ? '/admin' : user?.role === 'SELLER' ? '/seller' : '/');
