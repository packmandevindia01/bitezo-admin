// src/features/reports/services/customerRptListApi.ts
import api from "../../../utils/api";

export interface CustomerRptListParams {
  custName?: string;
  regId?: string;
  country?: string;
  isDemo?: string;
  database?: string;
  conMode?: string;
  dealerId?: number;
  empId?: number;
}

export interface CustomerRptListRow {
  custId: number;
  custName: string;
  custMob: string;
  custTel?: string;
  country: string;
  block?: string;
  area?: string;
  road?: string;
  building?: string;
  flatNo?: string;
  crNo?: string;
  email?: string;
  taxRegNo?: string;
  branchCount?: number;
  regId: string;
  database: string;
  conMode: string;
  version?: string;
  isDemo: string;
  dealerId?: number;
  dealerName?: string;
  empId?: number;
  employeeName?: string;
  createdDate?: string;
}

export interface CustomerRptListResult {
  rows: CustomerRptListRow[];
  emptyMessage?: string;
}

export const getCustomerReport = async (
  params: CustomerRptListParams
): Promise<CustomerRptListRow[]> => {
  try {
    const response = await api.get("/api/admin/customer/rptlist", {
      params: {
        country: params.country || "All",
        isDemo: params.isDemo || "All",
        conMode: params.conMode === "All" ? "All" : params.conMode?.toLowerCase(), // 👈 normalize casing
        ...(params.custName && { custName: params.custName }),
        ...(params.regId && { regId: params.regId }),
        ...(params.database && { database: params.database }),
        ...(typeof params.dealerId === "number" ? { dealerId: params.dealerId } : {}),
        ...(typeof params.empId === "number" ? { empId: params.empId } : {}),
      },
    });

    const body = response.data;
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : [];

    return list.map((item: Record<string, unknown>) => ({
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
      dealerName:
        (item.dealerName as string | undefined) ??
        (item.dealer as string | undefined) ??
        "",
      empId:
        (item.empId as number | undefined) ??
        (item.employeeId as number | undefined) ??
        0,
      employeeName:
        (item.employeeName as string | undefined) ??
        (item.empName as string | undefined) ??
        (item.employee as string | undefined) ??
        "",
      createdDate: (item.createdDate as string | undefined) ?? undefined,
    }));
  } catch (error: any) {
    if (error.message?.includes("No customers found")) return [];
    throw error;
  }
};

// Legacy export kept for ReportsPage compatibility
export const fetchCustomerRptList = async (
  params: CustomerRptListParams
): Promise<CustomerRptListResult> => {
  try {
    const rows = await getCustomerReport(params);
    return { rows };
  } catch (error: any) {
    if (error.message?.includes("No customers found")) {
      return { rows: [], emptyMessage: "No customers found" };
    }
    throw error;
  }
};
