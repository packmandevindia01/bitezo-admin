import type { CustomerFormData } from "../types";

export const createCustomer = async (data: CustomerFormData) => {
  const res = await fetch("http://84.255.173.131:8088/api/admin/customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json(); // ✅ parse JSON directly

  // ✅ handle backend error properly
  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Failed to create customer");
  }

  return result;
};

// ✅ GET CUSTOMERS (optional improvement)
export const getCustomers = async () => {
  const res = await fetch(
    "http://84.255.173.131:8088/api/admin/customer/list"
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch customers");
  }

  return result;
};