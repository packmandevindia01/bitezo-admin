import { generateExcel } from "./exportExcel";
import { generatePDF } from "./exportPDF";
import { formatDate } from "./reportHelpers";
import { getCountryName } from "../../../utils/countryMapper";

const excelColumns = [
  "ID",
  "Customer Name",
  "Mobile",
  "Telephone",
  "Dealer",
  "Employee",
  "Country",
  "Block",
  "Area / Street",
  "Road No",
  "Building No",
  "Flat No",
  "CR No",
  "Email",
  "Tax Reg No",
  "Branches",
  "Reg ID",
  "Database",
  "Connection Mode",
  "Version",
  "File Name",
  "File Path",
  "Created Date",
];

const pdfColumns = [
  "ID",
  "Customer Name",
  "Mobile",
  "Telephone",
  "Dealer",
  "Employee",
  "Country",
  "CR No",
  "Email",
  "Branches",
  "Reg ID",
  "Database",
  "Connection Mode",
  "Version",
  "Created Date",
];

const mapExcelRows = (customers: any[]) => {
  return customers.map((c) => [
    c.custId || "-",
    c.custName || "-",
    c.custMob || "-",
    c.custTel || "-",
    c.dealerName || (c.dealerId ? String(c.dealerId) : "-"),
    c.employeeName || (c.empId ? String(c.empId) : "-"),
    c.country ? getCountryName(c.country) : "-",
    c.block || "-",
    c.area || "-",
    c.road || "-",
    c.building || "-",
    c.flatNo || "-",
    c.crNo || "-",
    c.email || "-",
    c.taxRegNo || "-",
    c.branchCount ?? "-",
    c.regId || "-",
    c.database || "-",
    c.conMode || "-",
    c.version || c.isDemo || "-",
    c.fileName || "-",
    c.filePath || "-",
    c.createdDate ? formatDate(c.createdDate) : "-",
  ]);
};

const mapPdfRows = (customers: any[]) => {
  return customers.map((c) => [
    c.custId || "-",
    c.custName || "-",
    c.custMob || "-",
    c.custTel || "-",
    c.dealerName || (c.dealerId ? String(c.dealerId) : "-"),
    c.employeeName || (c.empId ? String(c.empId) : "-"),
    c.country ? getCountryName(c.country) : "-",
    c.crNo || "-",
    c.email || "-",
    c.branchCount ?? "-",
    c.regId || "-",
    c.database || "-",
    c.conMode || "-",
    c.version || c.isDemo || "-",
    c.createdDate ? formatDate(c.createdDate) : "-",
  ]);
};

export const exportCustomersExcel = (customers: any[]) => {
  const rows = mapExcelRows(customers);

  generateExcel("Customer Report", excelColumns, rows, "Customers_Report");
};

export const exportCustomersPDF = (customers: any[]) => {
  const rows = mapPdfRows(customers);

  generatePDF("Customer Report", pdfColumns, rows, "Customers_Report");
};
