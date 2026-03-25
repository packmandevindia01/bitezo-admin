import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerTable from "../components/CustomerTable";
import { useToast } from "../../../context/ToastContext";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchCustomers } from "../../../store/customerSlice";

// ✅ common components
import {
  Loader,
  EmptyState,
  Pagination,
  Button,
} from "../../../components/common";

const CustomerList = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ GET DATA FROM REDUX
  const { list: customers, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  // 📄 pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ✅ FETCH DATA USING REDUX
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // ❗ Handle error (optional but good)
  useEffect(() => {
    if (error) {
      showToast(error + " ❌", "error");
    }
  }, [error]);

  // 📄 pagination calculation
  const totalPages = Math.ceil(customers.length / pageSize);

  const paginatedCustomers = customers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ✅ UI states
  if (loading) return <Loader />;

  if (!customers.length)
    return (
      <EmptyState
        title="No customers found"
        description="There are no customers available right now."
        actionLabel="Add Customer"
        onAction={() => navigate("/dashboard/customers/create")}
      />
    );

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {/* 🔍 Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Customers</h2>

        <Button onClick={() => navigate("/dashboard/customers/create")}>
          + Add Customer
        </Button>
      </div>

      {/* 📊 Table */}
      <CustomerTable customers={paginatedCustomers} />

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerList;