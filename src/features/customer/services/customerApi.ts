// src/features/customer/services/customerApi.ts
import api from "../../../utils/api";
import type { CustomerFormData } from "../types";

// ✅ CREATE
export const createCustomer = async (data: CustomerFormData) => {
  const response = await api.post("/api/admin/customer", data);
  return response.data;
};

// ✅ GET ALL
export const getCustomers = async () => {
  const response = await api.get("/api/admin/customer/list");
  return response.data;
};

// ✅ GET BY ID
export const getCustomerById = async (id: number) => {
  const response = await api.get(`/api/admin/customer/${id}`);
  return response.data;
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
  data: CustomerFormData & { custId: number }
) => {
  const response = await api.put(`/api/admin/customer/${id}`, data);
  return response.data;
};