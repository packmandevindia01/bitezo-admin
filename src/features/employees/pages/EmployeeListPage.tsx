import { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastContext";
import { Button, Modal, FilterPanel, PageIntro } from "../../../components/common";
import { COUNTRY_FILTER_OPTIONS } from "../../../constants/formOptions";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../services/employeeApi";
import type { Employee, EmployeeFormData } from "../types";
import { getDealerListName } from "../../dealer/services/dealerApi";
import { getCountryList } from "../../customer/services/customerApi";
import type { SelectOption } from "../../../constants/formOptions";

const initialFilters = {
  empName: "",
  dealerId: "All",
  country: "All",
};

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const EmployeeList = () => {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [dealerOptions, setDealerOptions] = useState<SelectOption[]>([]);
  const [dealerFilterOptions, setDealerFilterOptions] = useState<SelectOption[]>([
    { label: "All", value: "All" },
  ]);
  const [countryFilterOptions, setCountryFilterOptions] = useState(COUNTRY_FILTER_OPTIONS);
  const [countryMap, setCountryMap] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const list = await getCountryList();
        if (list && list.length > 0) {
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
        // keep default
      }
    };
    loadCountries();
  }, []);

  const fetchEmployees = async (params: typeof initialFilters) => {
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
      setEmployees(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load", "error");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchEmployees(filters);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [filters.empName, filters.dealerId, filters.country, countryMap]);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const dealers = await getDealerListName();
        setDealerOptions(
          dealers.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          }))
        );
        setDealerFilterOptions([
          { label: "All", value: "All" },
          ...dealers.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          })),
        ]);
      } catch {
        setDealerOptions([]);
        setDealerFilterOptions([{ label: "All", value: "All" }]);
      }
    };

    fetchDealers();
  }, []);

  const handleCreate = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      showToast("Employee created successfully", "success");
      setCreateOpen(false);
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create", "error");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const employee = await getEmployeeById(id);
      setEditEmployee(employee);
      setEditOpen(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to fetch employee", "error");
    }
  };

  const handleUpdate = async (data: EmployeeFormData) => {
    if (!editEmployee) return;
    try {
      await updateEmployee(editEmployee.empId, data);
      showToast("Employee updated successfully", "success");
      setEditOpen(false);
      setEditEmployee(null);
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEmployee(deleteId);
      showToast("Employee deleted successfully", "success");
      setDeleteId(null);
      setEditOpen(false);
      setEditEmployee(null);
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageIntro
        title="Employees"
        description="Manage your staff and team members across all dealerships"
      />

      <FilterPanel
        onReset={() => {
          setFilters(initialFilters);
          fetchEmployees(initialFilters);
        }}
      >
        <div>
          <label className={labelClass}>Search</label>
          <input
            type="text"
            placeholder="Search by name..."
            className={inputClass}
            value={filters.empName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, empName: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={labelClass}>Dealer</label>
          <select
            className={inputClass}
            value={filters.dealerId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dealerId: e.target.value }))
            }
          >
            {dealerFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Country</label>
          <select
            className={inputClass}
            value={filters.country}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, country: e.target.value }))
            }
          >
            {countryFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </FilterPanel>

      <EmployeeTable
        employees={employees}
        loading={loading}
        onAdd={() => setCreateOpen(true)}
        onEdit={(emp) => handleEdit(emp.empId)}
        onDelete={(id) => setDeleteId(id)}
      />

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Employee"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          dealerOptions={dealerOptions}
        />
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditEmployee(null);
        }}
        title="Edit Employee"
      >
        <EmployeeForm
          initialData={editEmployee}
          onSubmit={handleUpdate}
          dealerOptions={dealerOptions}
          onDelete={() => editEmployee && setDeleteId(editEmployee.empId)}
          isEdit
        />
      </Modal>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
