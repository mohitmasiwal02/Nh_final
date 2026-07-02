import axios from 'axios';

// base URL comes from VITE_API_BASE_URL (.env); proxied to the Express backend by Vite (see vite.config.js)
const baseURL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({ baseURL });

// attach the access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          // refresh failed -> force logout
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
