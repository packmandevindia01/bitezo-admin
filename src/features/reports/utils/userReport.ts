import type { User } from "../../user/types";
import { generateExcel } from "./exportExcel";
import { generatePDF } from "./exportPDF";

const columns = ["ID", "User Name", "Email", "Status"];

export const exportUsersExcel = (users: User[]) => {
  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email || "-",
    u.active ? "Active" : "Inactive",
  ]);

  generateExcel("Users Report", columns, rows, "Users_Report");
};

export const exportUsersPDF = (users: User[]) => {
  const rows = users.map((u) => [
    u.id,
    u.name,
    u.email || "-",
    u.active ? "Active" : "Inactive",
  ]);

  generatePDF("Users Report", columns, rows, "Users_Report");
};