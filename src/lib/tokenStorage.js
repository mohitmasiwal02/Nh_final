// localStorage keys come from .env so the storage key names aren't hardcoded.
// Access token is NOT kept here — it lives in the Redux store (in-memory).
// Only the refresh token and user are persisted so a page refresh stays logged in.
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refreshToken';
const USER_KEY = import.meta.env.VITE_USER_KEY || 'user';

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

// clear only the auth-related keys (mirrors the previous localStorage.clear())
export const clearAuthStorage = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
