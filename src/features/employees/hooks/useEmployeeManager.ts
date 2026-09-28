import { useState, useEffect, useCallback, useTransition } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../services/employeeApi";
import { getDealerListName } from "../../dealer/services/dealerApi";
import { getCountryList } from "../../customer/services/customerApi";
import { COUNTRY_FILTER_OPTIONS } from "../../../constants/formOptions";
import type { Employee, EmployeeFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

export interface EmployeeFilters {
  empName: string;
  dealerId: string;
  country: string;
}

export const initialFilters: EmployeeFilters = {
  empName: "",
  dealerId: "All",
  country: "All",
};

export const useEmployeeManager = () => {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  // Data & loading state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog & modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter & option states
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);
  const [dealerOptions, setDealerOptions] = useState<SelectOption[]>([]);
  const [dealerFilterOptions, setDealerFilterOptions] = useState<SelectOption[]>([
    { label: "All", value: "All" },
  ]);
  const [countryFilterOptions, setCountryFilterOptions] = useState<SelectOption[]>(COUNTRY_FILTER_OPTIONS);
  const [countryMap, setCountryMap] = useState<Record<string, number>>({});

  // 1. Fetch Country List
  useEffect(() => {
    let mounted = true;
    const loadCountries = async () => {
      try {
        const list = await getCountryList();
        if (mounted && list && list.length > 0) {
          const map: Record<string, number> = {};
          const opts = [
            { label: "All", value: "All" },
            ...list.map((c) => {
              map[c.countryName.toLowerCase()] = c.countryId;
              return { label: c.countryName, value: c.countryName };
            }),
          ];
          setCountryMap(map);
          setCountryFilterOptions(opts);
        }
      } catch {
        // Keep default options
      }
    };
    loadCountries();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Dealers
  useEffect(() => {
    let mounted = true;
    const fetchDealers = async () => {
      try {
        const dealersList = await getDealerListName();
        if (mounted && dealersList && dealersList.length > 0) {
          const formatted = dealersList.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          }));
          setDealerOptions(formatted);
          setDealerFilterOptions([{ label: "All", value: "All" }, ...formatted]);
        }
      } catch {
        if (mounted) {
          setDealerOptions([]);
          setDealerFilterOptions([{ label: "All", value: "All" }]);
        }
      }
    };
    fetchDealers();
    return () => {
      mounted = false;
    };
  }, []);

  // 3. Fetch Employees with Filters
  const fetchEmployeesList = useCallback(
    async (params: EmployeeFilters) => {
      setLoading(true);
      try {
        const cid =
          params.country && params.country !== "All"
            ? countryMap[params.country.toLowerCase()]
            : undefined;

        const data = await getEmployees({
          empName: params.empName?.trim() || undefined,
          dealerId: params.dealerId !== "All" ? Number(params.dealerId) : undefined,
          countryId: cid,
        });
        startTransition(() => {
          setEmployees(data);
        });
      } catch (err: any) {
        showToast(err?.response?.data?.message || "Failed to load employees", "error");
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    },
    [countryMap, showToast]
  );

  // 4. Debounced Filter Reaction
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchEmployeesList(filters);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [filters.empName, filters.dealerId, filters.country, countryMap, fetchEmployeesList]);

  // 5. CRUD Operations
  const handleCreate = async (data: EmployeeFormData) => {
    setSubmitting(true);
    try {
      await createEmployee(data);
      showToast("Employee created successfully", "success");
      setCreateOpen(false);
      fetchEmployeesList(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create employee", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (employee: Employee) => {
    try {
      const full = await getEmployeeById(employee.empId);
      setEditEmployee({
        ...employee,
        ...full,
        empId: full.empId || employee.empId,
      });
    } catch {
      // Fallback to row data already in the table
      setEditEmployee(employee);
    }
    setEditOpen(true);
  };

  const handleUpdate = async (data: EmployeeFormData) => {
    if (!editEmployee) return;
    setSubmitting(true);
    try {
      await updateEmployee(editEmployee.empId, data);
      showToast("Employee updated successfully", "success");
      setEditOpen(false);
      setEditEmployee(null);
      fetchEmployeesList(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update employee", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteId);
      showToast("Employee deleted successfully", "success");
      setDeleteId(null);
      setEditOpen(false);
      setEditEmployee(null);
      fetchEmployeesList(filters);
    } catch (err: unknown) {
      const maybe = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      const msg =
        (typeof maybe?.response?.data === "string"
          ? maybe.response.data
          : maybe?.response?.data?.message) ||
        maybe?.message ||
        "Failed to delete employee";
      showToast(msg, "error");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    fetchEmployeesList(initialFilters);
  };

  const closeModals = () => {
    setCreateOpen(false);
    setEditOpen(false);
    setEditEmployee(null);
  };

  return {
    // Data & state
    employees,
    loading,
    submitting,
    deleting,
    // Filters & options
    filters,
    dealerOptions,
    dealerFilterOptions,
    countryFilterOptions,
    setFilters,
    handleResetFilters,
    // Modals
    createOpen,
    editOpen,
    editEmployee,
    deleteId,
    setCreateOpen,
    setEditOpen,
    setDeleteId,
    closeModals,
    // Actions
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    refetch: () => fetchEmployeesList(filters),
  };
};

export default useEmployeeManager;
