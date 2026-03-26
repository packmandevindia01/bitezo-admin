export const getCustomerReport = async (params: {
  custName?: string;
  regId?: string;
  country?: string;
  isDemo?: string;
  database?: string;
  conMode?: string;
}) => {
  const query = new URLSearchParams();

  // ✅ Always send defaults (IMPORTANT)
  query.append("country", params.country || "All");
  query.append("isDemo", params.isDemo || "All");
  query.append("conMode", params.conMode || "All");

  if (params.custName) query.append("custName", params.custName);
  if (params.regId) query.append("regId", params.regId);
  if (params.database) query.append("database", params.database);

  const res = await fetch(
    `http://84.255.173.131:8088/api/admin/customer/rptlist?${query.toString()}`
  );

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = [];
  }

  if (!res.ok) {
    if (text.includes("No customers found")) return [];
    throw new Error("Failed to fetch report");
  }

  return data;
};