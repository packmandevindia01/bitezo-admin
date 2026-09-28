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
    (item.EmpId as number | undefined) ??
    (item.employeeId as number | undefined) ??
    (item.EmployeeId as number | undefined) ??
    (item.id as number | undefined) ??
    (item.Id as number | undefined) ??
    0,
  name:
    (item.name as string | undefined) ??
    (item.Name as string | undefined) ??
    (item.empName as string | undefined) ??
    (item.EmpName as string | undefined) ??
    "",
  mobNo:
    (item.mobNo as string | undefined) ??
    (item.MobNo as string | undefined) ??
    (item.mobile as string | undefined) ??
    (item.Mobile as string | undefined) ??
    "",
  email:
    (item.email as string | undefined) ??
    (item.Email as string | undefined) ??
    "",
  countryId:
    Number(item.countryId ?? item.CountryId ?? item.countryID ?? item.CountryID) || 0,
  country:
    (item.country as string | undefined) ??
    (item.Country as string | undefined) ??
    (item.countryName as string | undefined) ??
    (item.CountryName as string | undefined) ??
    "",
  dealerId:
    Number(item.dealerId ?? item.DealerId ?? item.dealerID ?? item.DealerID) || 0,
  dealer:
    (item.dealer as string | undefined) ??
    (item.Dealer as string | undefined) ??
    (item.dealerName as string | undefined) ??
    (item.DealerName as string | undefined) ??
    undefined,
  isActive: parseIsActive(
    item.isActive !== undefined
      ? item.isActive
      : item.IsActive !== undefined
        ? item.IsActive
        : item.status !== undefined
          ? item.status
          : item.Status
  ),
  createdDate: (item.createdDate as string | undefined) ?? (item.CreatedDate as string | undefined) ?? undefined,
  modifiedDate: (item.modifiedDate as string | undefined) ?? (item.ModifiedDate as string | undefined) ?? undefined,
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
  const item = (
    Array.isArray(body)
      ? body[0]
      : Array.isArray(body?.data)
        ? body.data[0]
        : (body?.data ?? body ?? {})
  ) as Record<string, unknown>;
  const mapped = mapEmployee(item);
  if (!mapped.empId) {
    mapped.empId = empId;
  }
  return mapped;
};

// ── UPDATE: PUT /api/Employee/{empId} ───────────────────────────────────────
export const updateEmployee = async (
  empId: number,
  data: EmployeeFormData
): Promise<EmployeeApiResponse> => {
  const payload: UpdateEmployeePayload & { country?: string } = {
    empId: Number(empId),
    name: data.name,
    mobNo: data.mobNo,
    email: data.email,
    countryId: Number(data.countryId) || 0,
    dealerId: Number(data.dealerId) || 0,
    isActive: Boolean(data.isActive),
    modifiedDate: new Date().toISOString(),
  };

  if (data.country) {
    payload.country = data.country;
  }

  try {
    const response = await api.put("/api/Employee/" + empId, payload);
    return response.data;
  } catch (err: any) {
    // If PUT with ID in URL returned 404 or 405, fallback to PUT without ID in URL
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const fallbackResponse = await api.put("/api/Employee", payload);
      return fallbackResponse.data;
    }
    throw err;
  }
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
        (item.EmpId as number | undefined) ??
        (item.id as number | undefined) ??
        (item.Id as number | undefined) ??
        0,
      name:
        (item.name as string | undefined) ??
        (item.Name as string | undefined) ??
        (item.empName as string | undefined) ??
        (item.EmpName as string | undefined) ??
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
  try {
    const response = await api.delete("/api/Employee/" + empId);
    return response.data;
  } catch (err: unknown) {
    const maybe = err as { response?: { status?: number; data?: unknown }; message?: string };
    if (maybe?.response?.status === 405) {
      throw new Error(
        `Backend Error (405 Method Not Allowed): Server does not have a DELETE endpoint for /api/Employee/${empId}. Backend team must add [HttpDelete("{empId}")].`
      );
    }
    throw err;
  }
};
