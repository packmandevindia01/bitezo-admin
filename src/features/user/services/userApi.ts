// src/features/user/services/userApi.ts
import api from "../../../utils/api";
import type {
  CreateUserPayload,
  CreateUserResponse,
  UpdateUserPayload,
  UpdatePasswordPayload,
  User,
} from "../types";

// ✅ CREATE USER
export const createUser = async (
  data: CreateUserPayload
): Promise<CreateUserResponse> => {
  const response = await api.post("/api/User", data);
  return response.data;
};

const parseIsActive = (val: unknown): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    return lower === "true" || lower === "active" || lower === "1";
  }
  if (typeof val === "number") return val === 1;
  return false;
};

// ✅ GET ALL USERS
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/api/User/list");

  const list = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

  return list.map((item: any) => ({
    id: item.userId,
    name: item.userName,
    email: item.email || "",
    active: parseIsActive(item.isActive !== undefined ? item.isActive : (item.active !== undefined ? item.active : item.status)),
    isMaster: Boolean(item.isMaster),
  }));
};

// ✅ GET USER BY ID: GET /api/User/{userId}
export const getUserById = async (userId: number): Promise<User> => {
  const response = await api.get(`/api/User/${userId}`);
  const item = response.data?.data ?? response.data ?? {};
  return {
    id: item.userId ?? item.id ?? userId,
    name: item.userName ?? item.name ?? "",
    email: item.email || "",
    active: parseIsActive(item.isActive !== undefined ? item.isActive : (item.active !== undefined ? item.active : item.status)),
    isMaster: Boolean(item.isMaster),
  };
};

// ✅ UPDATE USER: PUT /api/User/{userId}
export const updateUser = async (
  data: UpdateUserPayload
): Promise<CreateUserResponse> => {
  const response = await api.put(`/api/User/${data.userId}`, data);
  return response.data;
};

// ✅ UPDATE PASSWORD: PUT /api/User/{userId}/update-password
export const changePassword = async (
  userId: number,
  data: UpdatePasswordPayload
): Promise<void> => {
  const response = await api.put(
    `/api/User/${userId}/update-password`,
    data
  );
  if (response.data && typeof response.data === "object") {
    const res = response.data as { success?: boolean; isSuccess?: boolean; message?: string };
    if (res.success === false || res.isSuccess === false) {
      throw new Error(res.message || "Current password is incorrect.");
    }
  }
  return response.data;
};