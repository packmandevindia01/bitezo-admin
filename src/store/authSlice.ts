// src/store/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  userId: number;
  userName: string;
  email: string;
  isMaster: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpiresAt: string | null;
}

const storedUser = localStorage.getItem("user");
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  sessionExpiresAt: localStorage.getItem("sessionExpiresAt"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
        sessionExpiresAt?: string | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiresAt = action.payload.sessionExpiresAt ?? null;

      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      if (action.payload.sessionExpiresAt) {
        localStorage.setItem("sessionExpiresAt", action.payload.sessionExpiresAt);
      } else {
        localStorage.removeItem("sessionExpiresAt");
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionExpiresAt = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiresAt");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
