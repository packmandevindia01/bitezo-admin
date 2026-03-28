// src/utils/api.ts
import axios from "axios";
import { store } from "../store/store";
import { setCredentials, clearCredentials } from "../store/authSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach Bearer token from Redux ──────────────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


// ── Response interceptor: try refresh on 401, else logout ───────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = store.getState().auth.refreshToken;

      // ✅ If no refresh token (e.g. login page), just reject — don't redirect
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${BASE_URL}/api/CompanyAuth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = response.data.accessToken;
        const currentState = store.getState().auth;

        store.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            refreshToken: currentState.refreshToken!,
            user: currentState.user!,
          })
        );

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch {
        // ✅ Only redirect if user was previously logged in
        store.dispatch(clearCredentials());
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ── apiFetch compatibility shim ──────────────────────────────────────────────
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const method = (options.method ?? "GET").toLowerCase() as
    | "get" | "post" | "put" | "patch" | "delete";

  const body = options.body ? JSON.parse(options.body as string) : undefined;

  const response = await api.request({
    url,
    method,
    data: body,
  });

  return response?.data;
};