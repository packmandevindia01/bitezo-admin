// src/features/auth/services/authApi.ts
import api from "../../../utils/api";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  session?: {
    expiresAt?: string;
  };
  user: {
    userId: number;
    userName: string;
    email?: string;
    isMaster?: boolean;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  session?: {
    expiresAt?: string;
  };
  user?: LoginResponse["user"];
}

type OtpVerificationResponse =
  | string
  | {
      token?: string;
      // Backend returns otpToken as either a direct string OR a nested object: { data: "JWT", status: 200, ... }
      otpToken?: string | { data?: string; token?: string; otpToken?: string; status?: number; message?: string; isSuccess?: boolean; [key: string]: unknown };
      data?: string | { token?: string; otpToken?: string; data?: string };
      message?: string;
    };

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/Auth/login", { username, password });
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  await api.post("/api/Auth/logout");
};

export const sendOtpApi = async (email: string) => {
  const response = await api.post(`/api/Auth/send-otp?email=${encodeURIComponent(email)}`);
  return response.data;
};

const extractOtpToken = (payload: OtpVerificationResponse): string => {
  // Direct string
  if (typeof payload === "string") {
    return payload;
  }

  // payload.otpToken is itself an object → backend wraps token inside it
  // Actual shape: { otpToken: { data: "JWT_STRING", status: 200, ... } }
  if (payload?.otpToken && typeof payload.otpToken === "object") {
    const nested = payload.otpToken as Record<string, unknown>;
    if (typeof nested.data === "string" && nested.data) return nested.data;
    if (typeof nested.token === "string" && nested.token) return nested.token;
    if (typeof nested.otpToken === "string" && nested.otpToken) return nested.otpToken;
  }

  // payload.otpToken is directly a string
  if (typeof payload?.otpToken === "string" && payload.otpToken) {
    return payload.otpToken;
  }

  // payload.token is directly a string
  if (typeof payload?.token === "string" && payload.token) {
    return payload.token;
  }

  // payload.data is a string
  if (typeof payload?.data === "string" && payload.data) {
    return payload.data;
  }

  // payload.data is an object with token/otpToken
  if (typeof payload?.data === "object" && payload.data) {
    const d = payload.data as Record<string, unknown>;
    if (typeof d.otpToken === "string" && d.otpToken) return d.otpToken;
    if (typeof d.token === "string" && d.token) return d.token;
    if (typeof d.data === "string" && d.data) return d.data;
  }

  return "";
};

export const verifyOtpApi = async (email: string, otp: string): Promise<string> => {
  const response = await api.post<OtpVerificationResponse>("/api/Auth/verify-otp", {
    email,
    otp,
  });

  return extractOtpToken(response.data);
};

export const resetPasswordApi = async (
  email: string,
  otpToken: string,
  newPassword: string
): Promise<void> => {
  await api.post(
    "/api/Auth/reset-password",
    { email, newPassword },
    { headers: { "Otp-Token": otpToken } }
  );
};


type AdminExistsResponse =
  | boolean
  | {
      exists?: boolean;
      userExists?: boolean;
      isExists?: boolean;
      data?:
        | boolean
        | {
            exists?: boolean;
            userExists?: boolean;
            isExists?: boolean;
          };
    };

const extractAdminExists = (payload: AdminExistsResponse): boolean => {
  if (typeof payload === "boolean") {
    return payload;
  }

  if (typeof payload?.data === "boolean") {
    return payload.data;
  }

  if (typeof payload?.data === "object" && payload.data) {
    return Boolean(payload.data.exists ?? payload.data.userExists ?? payload.data.isExists);
  }

  return Boolean(payload?.exists ?? payload?.userExists ?? payload?.isExists);
};

export const checkAdminExistsApi = async (
  email: string,
  otpToken?: string
): Promise<boolean> => {
  try {
    const response = await api.post<AdminExistsResponse>(
      "/api/Auth/check-admin",
      { email },
      {
        headers: otpToken
          ? {
              "Otp-Token": otpToken,
            }
          : undefined,
      }
    );

    return extractAdminExists(response.data);
  } catch (err: unknown) {
    const maybe = err as { response?: { status?: number } };
    if (maybe?.response?.status === 404) {
      return false;
    }
    throw err;
  }
};
