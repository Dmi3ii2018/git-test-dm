import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const authenticateGitHub = createAsyncThunk(
  'auth/authenticateGitHub',
  async ({ login, token }: {login: string, token: string}) => {
    const response = await axios.get(`https://api.github.com/users/${login}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(authenticateGitHub.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(authenticateGitHub.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(authenticateGitHub.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;