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
      otpToken?: string;
      data?: string | { token?: string; otpToken?: string };
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
