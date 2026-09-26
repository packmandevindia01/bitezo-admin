// src/utils/api.ts
import axios from "axios";
import { store } from "../store/store";
import { setCredentials, clearCredentials } from "../store/authSlice";
import { getConfig } from "../config";

export const getBaseUrl = (): string => getConfig().apiBaseUrl;

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: dynamic baseURL and attach Bearer token ─────────────
api.interceptors.request.use((config) => {
  // Dynamically set baseURL from runtime config (same as client-bitezo)
  config.baseURL = getBaseUrl();

  const token = store.getState().auth.accessToken;
  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else if (config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});


// ── Response interceptor: try refresh on 401, else logout ───────────────────
//
// Endpoints that are PUBLIC or OTP-gated — a 401 from these means wrong credentials
// or expired OTP, NOT an expired session. These must NEVER trigger token refresh or logout.
const PUBLIC_ENDPOINTS = [
  "/api/Auth/login",
  "/api/auth/login",
  "/api/Auth/send-otp",
  "/api/auth/send-otp",
  "/api/Auth/verify-otp",
  "/api/auth/verify-otp",
  "/api/Auth/refresh",
  "/api/auth/refresh",
  "/api/Auth/forgot-password",
  "/api/auth/forgot-password",
  "/api/Auth/reset-password",
  "/api/auth/reset-password",
];

const isPublicEndpoint = (url?: string): boolean =>
  PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

// If the request carried an Otp-Token header, a 401 means "wrong/expired OTP"
// NOT "session expired". Never log out in this case.
const hasOtpTokenHeader = (config: Record<string, unknown>): boolean => {
  const headers = config?.headers as Record<string, unknown> | undefined;
  if (!headers) return false;
  if (typeof (headers as { get?: (k: string) => unknown }).get === "function") {
    return !!(headers as { get: (k: string) => unknown }).get("Otp-Token");
  }
  return !!(headers["Otp-Token"] || headers["otp-token"]);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ── Do NOT attempt refresh/logout for public or OTP-gated endpoints ──
      if (isPublicEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      // ── Do NOT logout if this was an OTP-gated request (wrong OTP, not expired session) ──
      if (hasOtpTokenHeader(originalRequest)) {
        return Promise.reject(error);
      }

      const refreshToken = store.getState().auth.refreshToken;

      // ── No refresh token means user is on a public page; just reject ──
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // ── Try to refresh the access token ──
      try {
        const response = await axios.post(
          `${getBaseUrl()}/api/Auth/refresh`,
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
            sessionExpiresAt: currentState.sessionExpiresAt,
          })
        );

        // Retry the original request with the new access token
        if (originalRequest.headers && typeof originalRequest.headers.set === "function") {
          originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        } else if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);

      } catch {
        // ── Refresh itself failed — session is truly expired. Log out cleanly. ──
        store.dispatch(clearCredentials());
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
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