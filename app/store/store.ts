import { configureStore } from "@reduxjs/toolkit";
import reposReducer from "./repos";
import userReducer from './user'

export const store = configureStore({
  reducer: {
    repos: reposReducer,
    user: userReducer
  },
});