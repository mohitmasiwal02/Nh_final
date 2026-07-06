import { createSlice } from '@reduxjs/toolkit';
import { getStoredUser } from '../lib/tokenStorage';

const initialState = {
  user: getStoredUser(),
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, setAccessToken, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
