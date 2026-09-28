import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchCustomers } from "../../../store/customerSlice";
import { useToast } from "../../../context/ToastContext";

interface UseCustomerManagerOptions {
  pageSize?: number;
}

export const useCustomerManager = (options: UseCustomerManagerOptions = {}) => {
  const { pageSize = 8 } = options;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { list: customers, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error + " ❌", "error");
    }
  }, [error, showToast]);

  const totalPages = Math.ceil(customers.length / pageSize) || 1;

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, page, pageSize]);

  const goToCreateCustomer = useCallback(() => {
    navigate("/dashboard/customers/create");
  }, [navigate]);

  return {
    customers,
    paginatedCustomers,
    loading,
    error,
    page,
    setPage,
    totalPages,
    pageSize,
    goToCreateCustomer,
    refetch: () => dispatch(fetchCustomers()),
  };
};
