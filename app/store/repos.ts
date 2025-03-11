import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "repos",
  initialState: {
    currentRepo: null,
    repos: []
  },
  reducers: {
    view: (state, action) => {
      state.currentRepo = action.payload;
    },
    update: (state, action) => {
      state.currentRepo = action.payload;
    },
    deleteRepo: (state, action) => {
      state.repos = state.repos.filter(repo => repo !== action.payload);
    },
  },
});

export const { view, update, deleteRepo } = counterSlice.actions;
export default counterSlice.reducer;