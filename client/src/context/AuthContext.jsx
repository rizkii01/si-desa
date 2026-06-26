import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, nama_lengkap: user.nama_lengkap || '' };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  const login = async (nik, password) => {
    const res = await api.post('/auth/login', { nik, password });
    const normalized = normalizeUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api.get('/auth/me')
      .then((res) => {
        const normalized = normalizeUser(res.data);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
