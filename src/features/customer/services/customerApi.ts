// src/features/customer/services/customerApi.ts
import api from "../../../utils/api";
import type { Customer, CustomerFormData } from "../types";

const mapCustomer = (item: Record<string, unknown>): Customer => ({
  custId:
    (item.custId as number | undefined) ??
    (item.id as number | undefined) ??
    0,
  custName: (item.custName as string | undefined) ?? "",
  custMob: (item.custMob as string | undefined) ?? "",
  custTel: (item.custTel as string | undefined) ?? "",
  country: (item.country as string | undefined) ?? "",
  block: (item.block as string | undefined) ?? "",
  area: (item.area as string | undefined) ?? "",
  road: (item.road as string | undefined) ?? "",
  building: (item.building as string | undefined) ?? "",
  flatNo: (item.flatNo as string | undefined) ?? "",
  crNo: (item.crNo as string | undefined) ?? "",
  email: (item.email as string | undefined) ?? "",
  taxRegNo: (item.taxRegNo as string | undefined) ?? "",
  branchCount: (item.branchCount as number | undefined) ?? 0,
  regId: (item.regId as string | undefined) ?? "",
  database: (item.database as string | undefined) ?? "",
  conMode: (item.conMode as string | undefined) ?? "", 
  fileName: (item.fileName as string | undefined) ?? "",
  filePath: (item.filePath as string | undefined) ?? "",
  version:
    (item.version as string | undefined) ??
    (typeof item.isDemo === "boolean"
      ? item.isDemo
        ? "Demo"
        : "Licenced"
      : ((item.isDemo as string | undefined) ?? "")),
  isDemo:
    (item.version as string | undefined) ??
    (typeof item.isDemo === "boolean"
      ? item.isDemo
        ? "Demo"
        : "Licenced"
      : ((item.isDemo as string | undefined) ?? "")),
  dealerId: (item.dealerId as number | undefined) ?? 0,
  empId:
    (item.empId as number | undefined) ??
    (item.employeeId as number | undefined) ??
    0,
  dealerName:
    (item.dealerName as string | undefined) ??
    (item.dealer as string | undefined) ??
    "",
  employeeName:
    (item.employeeName as string | undefined) ??
    (item.empName as string | undefined) ??
    (item.employee as string | undefined) ??
    "",
  createdDate: (item.createdDate as string | undefined) ?? undefined,
});

// ✅ CREATE
export const createCustomer = async (
  data: CustomerFormData,
  otpToken?: string
) => {
  const response = await api.post("/api/admin/customer", data, {
    headers: otpToken
      ? {
          "Otp-Token": otpToken,
        }
      : undefined,
  });
  return response.data;
};

// ✅ GET ALL
export const getCustomers = async () => {
  const response = await api.get("/api/admin/customer/list");
  const body = response.data;
  const list = Array.isArray(body)
    ? body
      : Array.isArray(body?.data)
      ? body.data
      : [];
  return list.map((item: Record<string, unknown>) => mapCustomer(item));
};

// ✅ GET BY ID
export const getCustomerById = async (id: number) => {
  const response = await api.get(`/api/admin/customer/${id}`);
  const body = response.data;
  const item = (body?.data ?? body ?? {}) as Record<string, unknown>;
  return mapCustomer(item);
};

// ✅ GET NEXT REG ID
export const getNextRegId = async (): Promise<string> => {
  const response = await api.get("/api/admin/customer/nextregid");
  return response.data.data;
};

// ✅ UPDATE
// Note: backend may return plain text on errors (e.g. "ID mismatch")
// Axios handles this gracefully — non-2xx responses throw via the interceptor
export const updateCustomer = async (
  id: number,
  data: CustomerFormData & { custId: number },
  otpToken?: string
) => {
  const response = await api.put(`/api/admin/customer/${id}`, data, {
    headers: otpToken
      ? {
          "Otp-Token": otpToken,
        }
      : undefined,
  });
  return response.data;
};
