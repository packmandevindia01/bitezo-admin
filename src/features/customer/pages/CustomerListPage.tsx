import CustomerTable from "../components/CustomerTable";
import {
  Loader,
  EmptyState,
  Pagination,
  Button,
} from "../../../components/common";
import { useCustomerManager } from "../hooks/useCustomerManager";

const CustomerListPage = () => {
  const {
    customers,
    paginatedCustomers,
    loading,
    page,
    setPage,
    totalPages,
    goToCreateCustomer,
  } = useCustomerManager({ pageSize: 8 });

  // UI states
  if (loading) return <Loader />;

  if (!customers.length) {
    return (
      <EmptyState
        title="No customers found"
        description="There are no customers available right now."
        actionLabel="Add Customer"
        onAction={goToCreateCustomer}
      />
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Customers</h2>

        <Button onClick={goToCreateCustomer}>
          + Add Customer
        </Button>
      </div>

      {/* Table */}
      <CustomerTable customers={paginatedCustomers} />

      {/* Pagination */}
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

export default CustomerListPage;