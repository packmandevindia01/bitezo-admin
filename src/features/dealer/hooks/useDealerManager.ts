import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import { getCountryList } from "../../customer/services/customerApi";
import {
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
} from "../services/dealerApi";
import type { Dealer, DealerFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

export interface DealerFilters {
  dealerName: string;
  countryId: string;
}

const initialFilters: DealerFilters = {
  dealerName: "",
  countryId: "All",
};

export const useDealerManager = () => {
  const { showToast } = useToast();

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [countryFilterOptions, setCountryFilterOptions] = useState<SelectOption[]>([
    { label: "All", value: "All" },
  ]);

  const [filters, setFilters] = useState<DealerFilters>(initialFilters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<Dealer | null>(null);

  // Load countries for filter dropdown
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

  const fetchData = useCallback(async (params: DealerFilters) => {
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
  }, [showToast]);

  // Debounced search on filter change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData(filters);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [filters, fetchData]);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    fetchData(initialFilters);
  }, [fetchData]);

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

  const closeEditModal = useCallback(() => {
    setEditOpen(false);
    setEditDealer(null);
  }, []);

  return {
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
    refetch: () => fetchData(filters),
  };
};
