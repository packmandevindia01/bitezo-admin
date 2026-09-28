import { useState, useEffect, useCallback } from "react";
import { getCustomerReport } from "../services/customerRptListApi";
import type { CustomerRptListRow, CustomerRptListParams } from "../services/customerRptListApi";
import { getDealerListName } from "../../dealer/services/dealerApi";
import { getEmployees } from "../../employees/services/employeeApi";
import { exportCustomersExcel, exportCustomersPDF } from "../utils/customerReport";

export const INITIAL_REPORT_FILTERS: CustomerRptListParams = {
  custName: "",
  regId: "",
  database: "",
  country: "All",
  isDemo: "All",
  conMode: "All",
  dealerId: undefined,
  empId: undefined,
};

export interface ReportSelectOption {
  label: string;
  value: string;
}

export const useCustomerReport = () => {
  const [data, setData] = useState<CustomerRptListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<CustomerRptListParams>(INITIAL_REPORT_FILTERS);
  const [dealerOptions, setDealerOptions] = useState<ReportSelectOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<ReportSelectOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Load dealers for dropdown filter
  useEffect(() => {
    const loadDealers = async () => {
      try {
        const dealers = await getDealerListName();
        setDealerOptions(
          dealers.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          }))
        );
      } catch {
        setDealerOptions([]);
      }
    };

    loadDealers();
  }, []);

  // Cascade load employees when dealer changes
  useEffect(() => {
    const selectedDealerId = filters.dealerId;

    if (typeof selectedDealerId !== "number") {
      setEmployeeOptions([]);
      setFilters((prev) =>
        typeof prev.empId === "number" ? { ...prev, empId: undefined } : prev
      );
      return;
    }

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const employees = await getEmployees({ dealerId: selectedDealerId });
        const nextOptions = employees.map((employee) => ({
          label: employee.name,
          value: String(employee.empId),
        }));

        setEmployeeOptions(nextOptions);
        setFilters((prev) => {
          if (prev.dealerId !== selectedDealerId) return prev;

          const selectedStillExists = nextOptions.some(
            (option) => Number(option.value) === prev.empId
          );

          return selectedStillExists || typeof prev.empId !== "number"
            ? prev
            : { ...prev, empId: undefined };
        });
      } catch {
        setEmployeeOptions([]);
        setFilters((prev) =>
          prev.dealerId === selectedDealerId
            ? { ...prev, empId: undefined }
            : prev
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [filters.dealerId]);

  const fetchReport = useCallback(async (params: CustomerRptListParams) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getCustomerReport(params);
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on filters change
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchReport(filters);
    }, 500);
    return () => clearTimeout(delay);
  }, [filters, fetchReport]);

  const handleChange = (key: keyof CustomerRptListParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const setDealerId = useCallback((dealerId: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dealerId,
      empId: undefined,
    }));
  }, []);

  const setEmpId = useCallback((empId: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      empId,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(INITIAL_REPORT_FILTERS);
    setData([]);
    setHasSearched(false);
  }, []);

  const handleExportExcel = useCallback(() => {
    if (data.length > 0) {
      exportCustomersExcel(data);
    }
  }, [data]);

  const handleExportPDF = useCallback(() => {
    if (data.length > 0) {
      exportCustomersPDF(data);
    }
  }, [data]);

  return {
    data,
    loading,
    hasSearched,
    filters,
    dealerOptions,
    employeeOptions,
    loadingEmployees,
    handleChange,
    setDealerId,
    setEmpId,
    handleReset,
    handleExportExcel,
    handleExportPDF,
  };
};
