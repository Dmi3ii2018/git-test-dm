import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
}

interface GitHubState {
  repositories: Repository[];
  selectedRepo: Repository | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: GitHubState = {
  repositories: [],
  selectedRepo: null,
  status: "idle",
  error: null,
};

export const handleRepositories = createAsyncThunk(
  "github/fetchRepositories",
  async ({ login, token }: { login: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://api.github.com/users/${login}/repos`, {
        headers: { Authorization: `token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка при загрузке репозиториев");
    }
  }
);

export const updateRepository = createAsyncThunk(
  "github/updateRepository",
  async ({ login, token, repoName, data }: { login: string; token: string; repoName: string; data: Partial<Repository> }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`https://api.github.com/repos/${login}/${repoName}`, data, {
        headers: { Authorization: `token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка при обновлении репозитория");
    }
  }
);

export const deleteRepository = createAsyncThunk(
  "github/deleteRepository",
  async ({ login, token, repoName }: { login: string; token: string; repoName: string }, { rejectWithValue }) => {
    try {
      await axios.delete(`https://api.github.com/repos/${login}/${repoName}`, {
        headers: { Authorization: `token ${token}` },
      });
      return repoName;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка при удалении репозитория");
    }
  }
);

export const fetchRepositoryDetails = createAsyncThunk(
  "github/fetchRepositoryDetails",
  async ({ login, token, repoName }: { login: string; token: string; repoName: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${login}/${repoName}`, {
        headers: { Authorization: `token ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка при получении данных репозитория");
    }
  }
);

const githubSlice = createSlice({
  name: "github",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Получение репозиториев
      .addCase(fetchRepositories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRepositories.fulfilled, (state, action: PayloadAction<Repository[]>) => {
        state.status = "succeeded";
        state.repositories = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Обновление репозитория
      .addCase(updateRepository.fulfilled, (state, action: PayloadAction<Repository>) => {
        state.repositories = state.repositories.map((repo) =>
          repo.id === action.payload.id ? action.payload : repo
        );
      })
      // Удаление репозитория
      .addCase(deleteRepository.fulfilled, (state, action: PayloadAction<string>) => {
        state.repositories = state.repositories.filter((repo) => repo.name !== action.payload);
      })
      // Получение информации о репозитории
      .addCase(fetchRepositoryDetails.fulfilled, (state, action: PayloadAction<Repository>) => {
        state.selectedRepo = action.payload;
      });
  },
});

export default githubSlice.reducer;
