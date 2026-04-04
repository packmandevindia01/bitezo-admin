// src/features/auth/services/authApi.ts
import api from "../../../utils/api";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  session: {
    expiresAt: string;
  };
  user: {
    userId: number;
    userName: string;
    email: string;
    isMaster: boolean;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  session?: {
    expiresAt: string;
  };
  user?: LoginResponse["user"];
}

type OtpVerificationResponse =
  | string
  | {
      token?: string;
      otpToken?: string;
      data?: string | { token?: string; otpToken?: string };
      message?: string;
    };

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/admin/auth/login", { username, password });
  return response.data;
};

export const sendOtpApi = async (email: string) => {
  const response = await api.post("/api/admin/auth/send-otp", { email });
  return response.data;
};

const extractOtpToken = (payload: OtpVerificationResponse): string => {
  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload?.data === "string") {
    return payload.data;
  }

  return (
    payload?.otpToken ??
    payload?.token ??
    (typeof payload?.data === "object" ? payload.data?.otpToken ?? payload.data?.token : "") ??
    ""
  );
};

export const verifyOtpApi = async (email: string, otp: string): Promise<string> => {
  const response = await api.post<OtpVerificationResponse>("/api/admin/auth/verify-otp", {
    email,
    otp,
  });

  return extractOtpToken(response.data);
};
