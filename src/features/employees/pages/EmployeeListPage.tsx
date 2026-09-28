import { useEffect } from "react";
import { UserCog, UserPlus, X } from "lucide-react";
import { Button, Modal, FilterPanel, PageIntro } from "../../../components/common";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";
import { useEmployeeManager } from "../hooks/useEmployeeManager";

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const EmployeeListPage = () => {
  const {
    employees,
    loading,
    deleting,
    filters,
    dealerOptions,
    dealerFilterOptions,
    countryFilterOptions,
    createOpen,
    editOpen,
    editEmployee,
    deleteId,
    setFilters,
    handleResetFilters,
    setCreateOpen,
    setDeleteId,
    closeModals,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
  } = useEmployeeManager();

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (createOpen || editOpen) {
          closeModals();
        } else if (deleteId !== null) {
          setDeleteId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createOpen, editOpen, deleteId, closeModals, setDeleteId]);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Employees"
        description="Manage your staff and team members across all dealerships"
      />

      {/* Filter Bar */}
      <FilterPanel onReset={handleResetFilters}>
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

      {/* Employee Data Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        onAdd={() => setCreateOpen(true)}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Fullscreen Backoffice Employee Dialog (Client-Bitezo style) */}
      {(createOpen || editOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-in-out]"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#49293e]/10 text-[#49293e] flex items-center justify-center shadow-sm">
                  {editOpen ? <UserCog size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {editOpen ? "Edit Employee" : "Create New Employee"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editOpen
                      ? "Update employee profile, contact info, and dealership assignment"
                      : "Add a new staff member and assign them to an authorized dealership"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModals}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body with Scroll */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <EmployeeForm
                initialData={editOpen ? editEmployee : null}
                onSubmit={editOpen ? handleUpdate : handleCreate}
                dealerOptions={dealerOptions}
                onDelete={editOpen && editEmployee ? () => setDeleteId(editEmployee.empId) : undefined}
                onClose={closeModals}
                isEdit={editOpen}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeListPage;
