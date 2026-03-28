// src/features/reports/services/customerRptListApi.ts
import api from "../../../utils/api";

export interface CustomerRptListParams {
  custName?: string;
  regId?: string;
  country?: string;
  isDemo?: string;
  database?: string;
  conMode?: string;
}

export interface CustomerRptListRow {
  custId: number;
  custName: string;
  custMob: string;
  country: string;
  regId: string;
  database: string;
  conMode: string;
  isDemo: string;
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
      },
    });
    return response.data;
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