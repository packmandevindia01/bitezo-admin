import { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastContext";
import { Loader, Button, Modal, FilterPanel, PageIntro } from "../../../components/common";
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
  const [filters, setFilters] = useState(initialFilters);

  const fetchEmployees = async (params: typeof initialFilters) => {
    setLoading(true);
    try {
      const data = await getEmployees({
        empName: params.empName || undefined,
        dealerId: params.dealerId !== "All" ? Number(params.dealerId) : undefined,
        country: params.country,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.empName, filters.dealerId, filters.country]);

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
      await createEmployee({
        ...data,
        createdDate: new Date().toISOString(),
      });
      showToast("Employee created successfully", "success");
      setCreateOpen(false);
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create", "error");
    }
  };

  const handleEditOpen = async (empId: number) => {
    try {
      setLoading(true);
      const fullEmployee = await getEmployeeById(empId);
      setEditEmployee(fullEmployee);
      setEditOpen(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load employee details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: EmployeeFormData) => {
    if (!editEmployee) return;
    try {
      await updateEmployee({ empId: editEmployee.empId, ...data });
      showToast("Employee updated successfully", "success");
      setEditOpen(false);
      setEditEmployee(null);
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update", "error");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteEmployee(deleteId);
      showToast("Employee deleted successfully", "success");
      fetchEmployees(filters);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      <div className="space-y-4">
        <PageIntro
          title="Employees"
          description="Search and manage employee records"
        />

        <FilterPanel
          onReset={() => setFilters(initialFilters)}
          resetDisabled={loading}
        >
          <div>
            <label className={labelClass}>Employee Name</label>
            <input
              className={inputClass}
              value={filters.empName}
              placeholder="Search by employee name..."
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, empName: e.target.value }))
              }
              disabled={loading}
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
              disabled={loading}
            >
              {dealerFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              disabled={loading}
            >
              {COUNTRY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FilterPanel>

        <EmployeeTable
          employees={employees}
          onEdit={(emp) => {
            handleEditOpen(emp.empId);
          }}
          onDelete={(id) => setDeleteId(id)}
          onAdd={() => setCreateOpen(true)}
        />
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Employee"
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
        title={`Edit Employee - ${editEmployee?.name ?? ""}`}
      >
        <EmployeeForm
          initialData={editEmployee}
          onSubmit={handleEdit}
          dealerOptions={dealerOptions}
          onDelete={() => {
            setEditOpen(false);
            setDeleteId(editEmployee!.empId);
          }}
          isEdit={true}
        />
      </Modal>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
      >
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this employee?
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployeeList;
