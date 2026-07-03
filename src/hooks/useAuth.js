import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { setRefreshToken, setStoredUser, clearAuthStorage } from '../lib/tokenStorage';

// Same interface as the old AuthContext, now backed by Redux Toolkit.
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // shared by login/register: access token -> Redux, refresh token + user -> localStorage
  const persistSession = (data) => {
    setRefreshToken(data.refreshToken);
    setStoredUser(data.user);
    dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
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
    clearAuthStorage();
    dispatch(clearCredentials());
  };

  return { user, isAdmin, login, register, logout };
}
