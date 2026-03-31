import api from "../../../utils/api";
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeApiResponse,
} from "../types";

export interface EmployeeListParams {
  empName?: string;
  dealerId?: number;
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
  country: (item.country as string | undefined) ?? "",
  dealerId:
    (item.dealerId as number | undefined) ??
    0,
  dealer:
    (item.dealer as string | undefined) ??
    (item.dealerName as string | undefined) ??
    undefined,
  isActive: parseIsActive(item.isActive),
  createdDate: (item.createdDate as string | undefined) ?? undefined,
});

export const createEmployee = async (
  data: CreateEmployeePayload
): Promise<EmployeeApiResponse> => {
  const response = await api.post("/api/admin/employee", data);
  return response.data;
};

export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<Employee[]> => {
  try {
    const response = await api.get("/api/admin/employee/list", {
      params: {
        ...(params.empName ? { empName: params.empName } : {}),
        ...(typeof params.dealerId === "number" ? { dealerId: params.dealerId } : {}),
        ...(typeof params.country === "string" ? { country: params.country } : {}),
      },
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

export const getEmployeeById = async (empId: number): Promise<Employee> => {
  const response = await api.get(`/api/admin/employee/${empId}`);
  const body = response.data;
  const item = (body?.data ?? body ?? {}) as Record<string, unknown>;
  return mapEmployee(item);
};

export const updateEmployee = async (
  data: UpdateEmployeePayload
): Promise<EmployeeApiResponse> => {
  const { empId, ...rest } = data;
  const response = await api.put(`/api/admin/employee/${empId}`, rest);
  return response.data;
};

export const deleteEmployee = async (
  empId: number
): Promise<EmployeeApiResponse> => {
  const response = await api.delete(`/api/admin/employee/${empId}`);
  return response.data;
};
