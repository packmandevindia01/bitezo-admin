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
    active: item.isActive ?? item.status === "Active",
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
    active: item.isActive !== undefined ? Boolean(item.isActive) : Boolean(item.status === "Active"),
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
  return response.data;
};