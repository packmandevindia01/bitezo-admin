import { useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { FilterPanel, Modal, PageIntro } from "../../../components/common";
import { getCountryList } from "../../customer/services/customerApi";
import DealerTable from "../components/DealerTable";
import DealerForm from "../components/DealerForm";
import { createDealer, getDealers, getDealerById, updateDealer } from "../services/dealerApi";
import type { Dealer, DealerFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

const initialFilters = {
  dealerName: "",
  countryId: "All",
};

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const DealerListPage = () => {
  const { showToast } = useToast();

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [countryFilterOptions, setCountryFilterOptions] = useState<SelectOption[]>([
    { label: "All", value: "All" },
  ]);

  const [filters, setFilters] = useState(initialFilters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<Dealer | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const list = await getCountryList();
        if (list && list.length > 0) {
          const opts = [
            { label: "All", value: "All" },
            ...list.map((c) => ({
              label: c.countryName || "",
              value: String(c.countryId),
            })),
          ];
          setCountryFilterOptions(opts);
        }
      } catch {
        // keep default
      }
    };
    loadCountries();
  }, []);

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
      const cid =
        params.countryId && params.countryId !== "All"
          ? Number(params.countryId)
          : undefined;

      const data = await getDealers({
        dealerName: params.dealerName?.trim() || undefined,
        countryId: cid,
      });
      setDealers(data);
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to load dealers ❌", "error");
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchData(filters);
    }, 400);
    return () => window.clearTimeout(t);
  }, [filters.dealerName, filters.countryId]);

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

  const handleEdit = async (dealer: Dealer) => {
    try {
      const full = await getDealerById(dealer.dealerId);
      setEditDealer(full);
    } catch {
      setEditDealer(dealer);
    }
    setEditOpen(true);
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
      <div className="space-y-6">
        <PageIntro
          title="Dealers"
          description="Manage your dealer accounts and regional representatives"
        />

        <FilterPanel
          onReset={() => {
            setFilters(initialFilters);
            fetchData(initialFilters);
          }}
        >
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
        onClose={() => {
          setEditOpen(false);
          setEditDealer(null);
        }}
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
