import api from "../../../utils/api";
import type {
  Employee,
  EmployeeFormData,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeNameOption,
  EmployeeApiResponse,
} from "../types";

export interface EmployeeListParams {
  empName?: string;
  dealerId?: number;
  countryId?: number;
  country?: string;
}

const parseIsActive = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "active";
  }
  return false;
};

const mapEmployee = (item: Record<string, unknown>): Employee => ({
  empId:
    (item.empId as number | undefined) ??
    (item.id as number | undefined) ??
    0,
  name: (item.name as string | undefined) ?? "",
  mobNo: (item.mobNo as string | undefined) ?? "",
  email: (item.email as string | undefined) ?? "",
  countryId: (item.countryId as number | undefined) ?? 0,
  country: (item.country as string | undefined) ?? (item.countryName as string | undefined) ?? "",
  dealerId:
    (item.dealerId as number | undefined) ??
    0,
  dealer:
    (item.dealer as string | undefined) ??
    (item.dealerName as string | undefined) ??
    undefined,
  isActive: parseIsActive(item.isActive),
  createdDate: (item.createdDate as string | undefined) ?? undefined,
  modifiedDate: (item.modifiedDate as string | undefined) ?? undefined,
});

// ── CREATE: POST /api/Employee ───────────────────────────────────────────────
export const createEmployee = async (
  data: EmployeeFormData
): Promise<EmployeeApiResponse> => {
  const payload: CreateEmployeePayload = {
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    countryId: Number(data.countryId) || 0,
    dealerId: Number(data.dealerId) || 0,
    isActive: Boolean(data.isActive),
    createdDate: data.createdDate || new Date().toISOString(),
  };

  const response = await api.post("/api/Employee", payload);
  return response.data;
};

// ── GET LIST: GET /api/Employee/list ─────────────────────────────────────────
export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<Employee[]> => {
  try {
    const queryParams: Record<string, unknown> = {};
    if (params.empName?.trim()) {
      queryParams.empName = params.empName.trim();
    }
    if (params.dealerId !== undefined && params.dealerId !== null && Number(params.dealerId) > 0) {
      queryParams.dealerId = Number(params.dealerId);
    }
    if (params.countryId !== undefined && params.countryId !== null && Number(params.countryId) > 0) {
      queryParams.countryId = Number(params.countryId);
    }

    const response = await api.get("/api/Employee/list", {
      params: queryParams,
    });

    const body = response.data;
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : [];

    return list.map((item: Record<string, unknown>) => mapEmployee(item));
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
      String(message).toLowerCase().includes("no employees")
    ) {
      return [];
    }
    throw err;
  }
};

// ── GET BY ID: GET /api/Employee/{empId} ────────────────────────────────────
export const getEmployeeById = async (empId: number): Promise<Employee> => {
  const response = await api.get("/api/Employee/" + empId);
  const body = response.data;
  const item = (body?.data ?? body ?? {}) as Record<string, unknown>;
  return mapEmployee(item);
};

// ── UPDATE: PUT /api/Employee/{empId} ───────────────────────────────────────
export const updateEmployee = async (
  empId: number,
  data: EmployeeFormData
): Promise<EmployeeApiResponse> => {
  const payload: UpdateEmployeePayload = {
    empId,
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    countryId: Number(data.countryId) || 0,
    dealerId: Number(data.dealerId) || 0,
    isActive: Boolean(data.isActive),
    modifiedDate: new Date().toISOString(),
  };

  const response = await api.put("/api/Employee/" + empId, payload);
  return response.data;
};

// ── GET LISTNAME BY DEALER: GET /api/Employee/listname/dealer ───────────────
export const getEmployeeListNameByDealer = async (
  dealerId: number
): Promise<EmployeeNameOption[]> => {
  try {
    const response = await api.get("/api/Employee/listname/dealer", {
      params: { dealerId },
    });
    const body = response.data;
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : [];

    return list.map((item: Record<string, unknown>) => ({
      empId:
        (item.empId as number | undefined) ??
        (item.id as number | undefined) ??
        0,
      name:
        (item.name as string | undefined) ??
        (item.empName as string | undefined) ??
        "",
    }));
  } catch {
    return [];
  }
};

// ── DELETE: DELETE /api/Employee/{empId} ─────────────────────────────────────
export const deleteEmployee = async (
  empId: number
): Promise<EmployeeApiResponse> => {
  const response = await api.delete("/api/Employee/" + empId);
  return response.data;
};
