import { FilterPanel, Modal, PageIntro } from "../../../components/common";
import DealerTable from "../components/DealerTable";
import DealerForm from "../components/DealerForm";
import { useDealerManager } from "../hooks/useDealerManager";

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const DealerListPage = () => {
  const {
    dealers,
    loading,
    filters,
    setFilters,
    countryFilterOptions,
    createOpen,
    setCreateOpen,
    editOpen,
    editDealer,
    handleResetFilters,
    handleCreate,
    handleEdit,
    handleEditSubmit,
    closeEditModal,
  } = useDealerManager();

  return (
    <>
      <div className="space-y-6">
        <PageIntro
          title="Dealers"
          description="Manage your dealer accounts and regional representatives"
        />

        <FilterPanel onReset={handleResetFilters}>
          <div>
            <label className={labelClass}>Dealer Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              className={inputClass}
              value={filters.dealerName}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, dealerName: e.target.value }));
              }}
            />
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={filters.countryId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, countryId: e.target.value }));
              }}
            >
              {countryFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FilterPanel>

        <DealerTable
          dealers={dealers}
          loading={loading}
          onAdd={() => setCreateOpen(true)}
          onEdit={handleEdit}
        />
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Dealer">
        <DealerForm onSubmit={handleCreate} isEdit={false} />
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={closeEditModal}
        title={"Edit Dealer — " + (editDealer?.name ?? "")}
      >
        <DealerForm
          initialData={editDealer}
          onSubmit={handleEditSubmit}
          isEdit={true}
        />
      </Modal>
    </>
  );
};

export default DealerListPage;
