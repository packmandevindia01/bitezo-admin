// src/features/user/services/userApi.ts
import api from "../../../utils/api";
import type { CreateUserPayload, CreateUserResponse, User } from "../types";

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
export const updateUser = async (data: {
  userId: number;
  userName: string;
  password: string;
  email: string;
  isActive: boolean;
  isMaster: boolean;
}) => {
  const response = await api.put("/api/admin/user", data);
  return response.data;
};