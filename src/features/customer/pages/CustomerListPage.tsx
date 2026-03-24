import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ NEW
import CustomerTable from "../components/CustomerTable";
import { getCustomers } from "../services/customerApi";
import type { Customer } from "../types";
import { useToast } from "../../../context/ToastContext";

// ✅ common components
import {
  Loader,
  EmptyState,
  Pagination,
  Button,
} from "../../../components/common";

const CustomerList = () => {
  const { showToast } = useToast();
  const navigate = useNavigate(); // ✅ NEW

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // 📄 pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ✅ fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load customers ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
        onAction={() => navigate("/dashboard/customers/create")} // ✅ navigate
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