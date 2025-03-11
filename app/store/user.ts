import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: number,
  login: string;
  avatar_url: string;
}
interface UserState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  status: 'idle',
  error: null,
  token: null,
}

export const authenticateGitHub = createAsyncThunk(
  'auth/authenticateGitHub',
  async ({ login, token }: {login: string, token: string}) => {
    const response = await axios.get(`https://api.github.com/users/${login}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    return {response: response.data, token};
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
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
        state.user = action.payload.response;
        state.token = action.payload.token
      })
      .addCase(authenticateGitHub.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;