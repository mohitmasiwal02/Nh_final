import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken, clearCredentials } from '../store/authSlice';
import { getRefreshToken, clearAuthStorage } from '../lib/tokenStorage';

// base URL comes from VITE_API_BASE_URL (.env); proxied to the Express backend by Vite (see vite.config.js)
const baseURL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({ baseURL });

// attach the access token (kept in Redux) to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// on 401, try once to refresh the access token, then retry the request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/refresh-token`, { refreshToken });
          store.dispatch(setAccessToken(data.accessToken));
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          // refresh failed -> force logout
          store.dispatch(clearCredentials());
          clearAuthStorage();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
