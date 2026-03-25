import type {
  CreateUserPayload,
  CreateUserResponse,
  User,
} from "../types";

const BASE_URL = "http://84.255.173.131:8088/api/admin/user";

// ✅ CREATE USER
export const createUser = async (
  data: CreateUserPayload
): Promise<CreateUserResponse> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result?.message || "Failed to create user");
  }

  return result;
};

export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE_URL}/list`);

  const result = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return result.map((item: any) => ({
    id: item.userId,
    name: item.userName,
    email: item.email || "",
    active: item.status === "Active",
    isMaster: false, // backend doesn't provide
  }));
};

export const updateUser = async (data: {
  userId: number;
  userName: string;
  password: string;
  email: string;
  isActive: boolean;
  isMaster: boolean;
}) => {
  const res = await fetch("http://84.255.173.131:8088/api/admin/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Failed to update user");
  }

  return result;
};