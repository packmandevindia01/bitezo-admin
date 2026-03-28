import api from "../../../utils/api";
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeApiResponse,
} from "../types";

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createEmployee = async (
  data: CreateEmployeePayload
): Promise<EmployeeApiResponse> => {
  const response = await api.post("/api/admin/employee", data);
  return response.data;
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get("/api/admin/employee/list");
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    mobNo: item.mobNo || "",
    email: item.email || "",
    country: item.country || "",
    isActive: item.isActive ?? true,
  }));
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateEmployee = async (
  data: UpdateEmployeePayload
): Promise<EmployeeApiResponse> => {
  const response = await api.put("/api/admin/employee", data);
  return response.data;
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteEmployee = async (
  id: number
): Promise<EmployeeApiResponse> => {
  const response = await api.delete(`/api/admin/employee/${id}`);
  return response.data;
};