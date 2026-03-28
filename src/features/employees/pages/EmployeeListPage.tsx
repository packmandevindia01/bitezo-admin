import { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastContext";
import { Loader, Button, Modal } from "../../../components/common";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../services/employeeApi";
import type { Employee, EmployeeFormData } from "../types";

const EmployeeList = () => {
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── CREATE ────────────────────────────────────────────────────────────────
  const handleCreate = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      showToast("Employee created successfully 🎉", "success");
      fetchEmployees();
      setCreateOpen(false);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create ❌", "error");
    }
  };

  // ── EDIT ──────────────────────────────────────────────────────────────────
  const handleEdit = async (data: EmployeeFormData) => {
    if (!editEmployee) return;
    try {
      await updateEmployee({ id: editEmployee.id, ...data });
      showToast("Employee updated successfully ✏️", "success");
      fetchEmployees();
      setEditOpen(false);
      setEditEmployee(null);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update ❌", "error");
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteEmployee(deleteId);
      showToast("Employee deleted successfully 🗑️", "success");
      fetchEmployees();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete ❌", "error");
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

      <EmployeeTable
        employees={employees}
        onEdit={(emp) => { setEditEmployee(emp); setEditOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
        onAdd={() => setCreateOpen(true)}
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Employee"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditEmployee(null); }}
        title={`Edit Employee — ${editEmployee?.name ?? ""}`}
      >
        <EmployeeForm
          initialData={editEmployee}
          onSubmit={handleEdit}
          onCancel={() => { setEditOpen(false); setEditEmployee(null); }}
          onDelete={() => { setEditOpen(false); setDeleteId(editEmployee!.id); }}
          isEdit={true}
        />
      </Modal>

      {/* DELETE CONFIRM MODAL */}
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