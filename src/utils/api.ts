// src/utils/api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 + errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.resolve(); // same as your apiFetch returning undefined
    }
    throw new Error(`API Error: ${error.response?.status ?? "Network Error"}`);
  }
);

export default api;

// ── apiFetch compatibility shim ───────────────────────────────────────────────
// Keeps all existing code that calls apiFetch(url, options) working unchanged.
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