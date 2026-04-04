import { useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { FilterPanel, Loader, Modal, PageIntro } from "../../../components/common";
import { COUNTRY_FILTER_OPTIONS } from "../../../constants/formOptions";

import DealerTable from "../components/DealerTable";
import DealerForm from "../components/DealerForm";

import { createDealer, getDealers, updateDealer } from "../services/dealerApi";
import type { Dealer, DealerFormData } from "../types";

const initialFilters = {
  dealerName: "",
  country: "All",
};

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const DealerListPage = () => {
  const { showToast } = useToast();

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState(initialFilters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<Dealer | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null) {
      const maybe = err as {
        response?: { data?: unknown; status?: number };
        message?: unknown;
      };

      const data = maybe.response?.data;
      if (typeof data === "string") return data;

      if (typeof data === "object" && data !== null) {
        const maybeData = data as { message?: unknown };
        if (typeof maybeData.message === "string") return maybeData.message;
      }

      if (typeof maybe.message === "string") return maybe.message;
    }

    return "Request failed";
  };

  const fetchData = async (params: typeof initialFilters) => {
    setLoading(true);
    try {
      const data = await getDealers({
        dealerName: params.dealerName || undefined,
        country: params.country,
      });
      setDealers(data);
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to load dealers ❌", "error");
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch with debounce on filter change
  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchData(filters);
    }, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dealerName, filters.country]);

  const handleCreate = async (data: DealerFormData) => {
    try {
      await createDealer(data);
      showToast("Dealer created successfully 🎉", "success");
      setCreateOpen(false);
      fetchData(filters);
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to create ❌", "error");
    }
  };

  const handleEditSubmit = async (data: DealerFormData) => {
    if (!editDealer) return;
    try {
      await updateDealer(editDealer.dealerId, data);
      showToast("Dealer updated successfully ✏️", "success");
      setEditOpen(false);
      setEditDealer(null);
      fetchData(filters);
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to update ❌", "error");
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
          title="Dealers"
          description="Search and manage dealer records"
        />

        <FilterPanel
          onReset={() => {
            setFilters(initialFilters);
          }}
          resetDisabled={loading}
        >
          <div>
            <label className={labelClass}>Dealer Name</label>
            <input
              className={inputClass}
              placeholder="Search by dealer name..."
              value={filters.dealerName}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, dealerName: e.target.value }));
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={filters.country}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, country: e.target.value }));
              }}
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

        <DealerTable
          dealers={dealers}
          onAdd={() => setCreateOpen(true)}
          onEdit={(dealer) => {
            setEditDealer(dealer);
            setEditOpen(true);
          }}
        />
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Dealer">
        <DealerForm onSubmit={handleCreate} isEdit={false} />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditDealer(null);
        }}
        title={`Edit Dealer — ${editDealer?.name ?? ""}`}
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

