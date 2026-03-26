import { generateExcel } from "./exportExcel";
import { generatePDF } from "./exportPDF";
import { formatDate } from "./reportHelpers";

const columns = [
  "ID",
  "Customer Name",
  "Mobile",
  "Telephone",
  "Country",
  "CR No",
  "Email",
  "Branches",
  "Reg ID",
  "Database",
  "Connection Mode",
  "Demo",
  "Created Date",
];

// 🔥 COMMON ROW MAPPER
const mapRows = (customers: any[]) => {
  return customers.map((c) => [
    c.custId || "-",
    c.custName || "-",
    c.custMob || "-",
    c.custTel || "-",
    c.country || "-",
    c.crNo || "-",
    c.email || "-",
    c.branchCount ?? "-",
    c.regId || "-",
    c.database || "-",
    c.conMode || "-",
    c.isDemo || "-",
    c.createdDate ? formatDate(c.createdDate) : "-",
  ]);
};

// ✅ EXCEL
export const exportCustomersExcel = (customers: any[]) => {
  const rows = mapRows(customers);

  generateExcel(
    "Customer Report",
    columns,
    rows,
    "Customers_Report"
  );
};

// ✅ PDF
export const exportCustomersPDF = (customers: any[]) => {
  const rows = mapRows(customers);

  generatePDF(
    "Customer Report",
    columns,
    rows,
    "Customers_Report"
  );
};