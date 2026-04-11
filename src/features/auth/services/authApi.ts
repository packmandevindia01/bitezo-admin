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
  const response = await api.post<AdminExistsResponse>(
    "/api/admin/auth/check-admin",
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
};
