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

// ✅ GET USERS (typed properly)
export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE_URL}/list`);

  const result = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  // ✅ correct mapping
  return result.map((item: any) => ({
    id: item.userId,
    name: item.userName,
    email: item.email,
    active: item.status === "Active",
    isMaster: false, // backend not giving → default
  }));
};