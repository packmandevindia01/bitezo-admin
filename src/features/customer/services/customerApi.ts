import type { CustomerFormData } from "../types";

// ✅ CREATE
export const createCustomer = async (data: CustomerFormData) => {
  const res = await fetch("http://84.255.173.131:8088/api/admin/customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Failed to create customer");
  }

  return result;
};

// ✅ GET ALL
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

// ✅ GET BY ID (🔥 IMPORTANT FOR EDIT)
export const getCustomerById = async (id: number) => {
  const res = await fetch(
    `http://84.255.173.131:8088/api/admin/customer/${id}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch customer");
  }

  return data; // full customer object
};

// ✅ GET NEXT REG ID
export const getNextRegId = async (): Promise<string> => {
  const res = await fetch(
    "http://84.255.173.131:8088/api/admin/customer/nextregid"
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error("Failed to fetch Registration ID");
  }

  return data.data;
};

// ✅ UPDATE
export const updateCustomer = async (
  id: number,
  data: CustomerFormData & { custId: number }
) => {
  const res = await fetch(
    `http://84.255.173.131:8088/api/admin/customer/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(data),
    }
  );

  // ⚠️ backend sometimes returns plain text (like "ID mismatch")
  let result;
  const text = await res.text();

  try {
    result = JSON.parse(text);
  } catch {
    result = { message: text };
  }

  if (!res.ok) {
    throw new Error(result.message || "Failed to update customer");
  }

  return result;
};