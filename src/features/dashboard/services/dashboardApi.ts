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

const mapMonthCount = (item: any): MonthCount => ({
  month: String(item?.month ?? item?.Month ?? item?.name ?? item?.Name ?? item?.date ?? item?.Date ?? ""),
  count: Number(item?.count ?? item?.Count ?? item?.value ?? item?.Value ?? item?.total ?? item?.Total ?? 0) || 0,
});

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get("/api/Dashboard");
  const body = response.data;
  const raw = (body?.data ?? body ?? {}) as Record<string, any>;

  const rawLast6 = raw.last_6_months ?? raw.last6Months ?? raw.Last6Months ?? raw.last6_months ?? [];
  const rawLast12 = raw.last_12_months ?? raw.last12Months ?? raw.Last12Months ?? raw.last12_months ?? [];

  return {
    customers: Number(raw.customers ?? raw.Customers ?? raw.totalCustomers ?? raw.TotalCustomers ?? 0) || 0,
    customers_demo: Number(raw.customers_demo ?? raw.customersDemo ?? raw.CustomersDemo ?? raw.demoCustomers ?? raw.DemoCustomers ?? 0) || 0,
    customers_inactive: Number(raw.customers_inactive ?? raw.customersInactive ?? raw.CustomersInactive ?? raw.inactiveCustomers ?? raw.InactiveCustomers ?? 0) || 0,
    last_6_months: Array.isArray(rawLast6) ? rawLast6.map(mapMonthCount) : [],
    last_12_months: Array.isArray(rawLast12) ? rawLast12.map(mapMonthCount) : [],
  };
};