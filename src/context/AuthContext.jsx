import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // hydrate from localStorage so a refresh keeps the user logged in
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  // shared by login/register: persist tokens + user and update state
  const persistSession = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    return persistSession(data);
  };

  const register = async (payload) => {
    const { data } = await api.post('/signup', payload);
    return persistSession(data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
