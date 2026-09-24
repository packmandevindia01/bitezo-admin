import api from "../../../utils/api";
import type {
  Dealer,
  DealerFormData,
  CreateDealerPayload,
  UpdateDealerPayload,
  DealerApiResponse,
} from "../types";

export interface DealerListParams {
  dealerName?: string;
  countryId?: number;
  country?: string;
}

export interface DealerNameOption {
  dealerId: number;
  dealerName: string;
}

const parseIsActive = (val: unknown): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    return lower === "true" || lower === "active";
  }
  return false;
};

// ── CREATE: POST /api/Dealer ─────────────────────────────────────────────────
export const createDealer = async (
  data: DealerFormData
): Promise<DealerApiResponse> => {
  const payload: CreateDealerPayload = {
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    countryId: Number(data.countryId) || 0,
    isActive: Boolean(data.isActive),
    createdDate: data.createdDate || new Date().toISOString(),
  };

  const response = await api.post("/api/Dealer", payload);
  return response.data;
};

// ── GET LIST: GET /api/Dealer/list ───────────────────────────────────────────
export const getDealers = async (
  params: DealerListParams = {}
): Promise<Dealer[]> => {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.dealerName?.trim()) {
      queryParams.dealerName = params.dealerName.trim();
    }
    if (params.countryId !== undefined && params.countryId !== null && Number(params.countryId) > 0) {
      queryParams.countryId = Number(params.countryId);
    }

    const response = await api.get("/api/Dealer/list", {
      params: queryParams,
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
      countryId: (item.countryId as number | undefined) ?? 0,
      country: (item.country as string | undefined) ?? (item.countryName as string | undefined) ?? "",
      isActive: parseIsActive(item.isActive),
      createdDate:
        (item.createdDate as string | undefined) ?? new Date().toISOString(),
      modifiedDate: (item.modifiedDate as string | undefined) ?? undefined,
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
      String(message).toLowerCase().includes("no dealers") ||
      String(message).toLowerCase().includes("no customers")
    ) {
      return [];
    }
    throw err;
  }
};

// ── GET BY ID: GET /api/Dealer/{dealerId} ────────────────────────────────────
export const getDealerById = async (dealerId: number): Promise<Dealer> => {
  const response = await api.get("/api/Dealer/" + dealerId);
  const item = (response.data?.data ?? response.data ?? {}) as Record<string, unknown>;

  return {
    dealerId:
      (item.dealerId as number | undefined) ?? dealerId,
    name: (item.name as string | undefined) ?? "",
    mobNo: (item.mobNo as string | undefined) ?? "",
    email: (item.email as string | undefined) ?? "",
    countryId: (item.countryId as number | undefined) ?? 0,
    country: (item.country as string | undefined) ?? (item.countryName as string | undefined) ?? "",
    isActive: parseIsActive(item.isActive),
    createdDate:
      (item.createdDate as string | undefined) ?? new Date().toISOString(),
    modifiedDate: (item.modifiedDate as string | undefined) ?? undefined,
  };
};

// ── UPDATE: PUT /api/Dealer/{dealerId} ───────────────────────────────────────
export const updateDealer = async (
  dealerId: number,
  data: DealerFormData
): Promise<DealerApiResponse> => {
  const payload: UpdateDealerPayload = {
    dealerId,
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    countryId: Number(data.countryId) || 0,
    isActive: Boolean(data.isActive),
    modifiedDate: new Date().toISOString(),
  };

  const response = await api.put("/api/Dealer/" + dealerId, payload);
  return response.data;
};

// ── LIST NAME: GET /api/Dealer/listname ──────────────────────────────────────
export const getDealerListName = async (): Promise<DealerNameOption[]> => {
  try {
    const response = await api.get("/api/Dealer/listname");
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
      dealerName:
        (item.dealerName as string | undefined) ??
        (item.name as string | undefined) ??
        "",
    }));
  } catch (err: unknown) {
    const maybe = err as {
      response?: { status?: number; data?: unknown };
    };

    if (maybe.response?.status === 404 || maybe.response?.status === 400) {
      return [];
    }
    throw err;
  }
};
