import api from "../../../utils/api";
import type {
  Dealer,
  CreateDealerPayload,
  DealerApiResponse,
} from "../types";

export interface DealerListParams {
  dealerName?: string;
  country?: string;
}

// ── Helper to parse isActive from any backend format ─────────────────────────
const parseIsActive = (val: unknown): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    return lower === "true" || lower === "active";
  }
  return false;
};

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createDealer = async (
  data: CreateDealerPayload
): Promise<DealerApiResponse> => {
  const response = await api.post("/api/admin/dealer", data);
  return response.data;
};

// ── GET LIST ──────────────────────────────────────────────────────────────────
export const getDealers = async (
  params: DealerListParams = {}
): Promise<Dealer[]> => {
  try {
    const response = await api.get("/api/admin/dealer/list", {
      params: {
        ...(params.dealerName ? { dealerName: params.dealerName } : {}),
        ...(params.country ? { country: params.country } : {}),
      },
    });

    const body = response.data;
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : [];

    return list.map((item: Record<string, unknown>) => ({
      dealerId:
        (item.dealerId as number | undefined) ??
        (item.id as number | undefined) ??
        0,
      name: (item.name as string | undefined) ?? "",
      mobNo: (item.mobNo as string | undefined) ?? "",
      email: (item.email as string | undefined) ?? "",
      country: (item.country as string | undefined) ?? "",
      isActive: parseIsActive(item.isActive), // ✅ handles "Active", "true", true
      createdDate:
        (item.createdDate as string | undefined) ?? new Date().toISOString(),
    }));
  } catch (err: unknown) {
    const maybe = err as {
      response?: { status?: number; data?: unknown };
      message?: unknown;
    };

    const status = maybe.response?.status;
    const data = maybe.response?.data;
    const message =
      (typeof data === "object" && data !== null && "message" in data
        ? (data as { message?: unknown }).message
        : data) ?? maybe.message;

    if (
      status === 404 ||
      String(message).toLowerCase().includes("no customers")
    ) {
      return [];
    }
    throw err;
  }
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
export const getDealerById = async (dealerId: number): Promise<Dealer> => {
  const response = await api.get(`/api/admin/dealer/${dealerId}`);
  const item = (response.data ?? {}) as Record<string, unknown>;

  return {
    dealerId:
      (item.dealerId as number | undefined) ?? dealerId,
    name: (item.name as string | undefined) ?? "",
    mobNo: (item.mobNo as string | undefined) ?? "",
    email: (item.email as string | undefined) ?? "",
    country: (item.country as string | undefined) ?? "",
    isActive: parseIsActive(item.isActive), // ✅ fixed
    createdDate:
      (item.createdDate as string | undefined) ?? new Date().toISOString(),
  };
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateDealer = async (
  dealerId: number,
  data: CreateDealerPayload
): Promise<DealerApiResponse> => {
  const payload = {
    dealerId,
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    country: data.country,
    isActive: Boolean(data.isActive),
    createdDate: data.createdDate,
  };

  const response = await api.put(`/api/admin/dealer/${dealerId}`, payload);
  return response.data;
};
