// src/features/user/services/userApi.ts
import api from "../../../utils/api";
import type { CreateUserPayload, CreateUserResponse,UpdateUserPayload, User } from "../types";

// ✅ CREATE USER
export const createUser = async (
  data: CreateUserPayload
): Promise<CreateUserResponse> => {
  const response = await api.post("/api/admin/user", data);
  return response.data;
};

// ✅ GET ALL USERS
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/api/admin/user/list");

  return response.data.map((item: any) => ({
    id: item.userId,
    name: item.userName,
    email: item.email || "",
    active: item.status === "Active",
    isMaster: false, // backend doesn't provide this field
  }));
};

// ✅ UPDATE USER
export const updateUser = async (
  data: UpdateUserPayload
): Promise<CreateUserResponse> => {
  const response = await api.put("/api/admin/user", data);
  return response.data;
};

export const changePassword = async (
  userId: number,
  data: { currentPassword: string; newPassword: string }
): Promise<void> => {
  const response = await api.put(
    `/api/admin/user/${userId}/update-password`,
    data
  );
  return response.data;
};