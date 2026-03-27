// src/features/dashboard/services/dashboardApi.ts
import api from "../../../utils/api";

export interface MonthCount {
  month: string;
  count: number;
}

export interface DashboardData {
  customers: number;
  customers_demo: number;
  customers_inactive: number;
  last_6_months: MonthCount[];
  last_12_months: MonthCount[];
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get("/api/CompanyDashboard");
  return response.data;
};