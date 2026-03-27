// src/features/auth/services/authApi.ts
import api from "../../../utils/api";

export const loginApi = async (username: string, password: string) => {
  const response = await api.post("/api/CompanyAuth/login", { username, password });
  return response.data;
};