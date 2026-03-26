import * as XLSX from "xlsx";
import { formatDate } from "./reportHelpers";

export const generateExcel = (
  title: string,
  columns: string[],
  rows: any[][],
  fileName: string
) => {
  const formattedDate = formatDate(new Date());

  const data = [
    [title],
    [`Date: ${formattedDate}`],
    [],
    columns,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const range = XLSX.utils.decode_range(ws["!ref"] || "");
  const lastCol = columns.length - 1;

  // 🔥 MERGE TITLE + DATE ACROSS ALL COLUMNS
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, // Title row
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }, // Date row
  ];

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellRef]) continue;

      const isHeader = R === 3;

      ws[cellRef].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        font: {
          bold: isHeader,
        },
      };
    }
  }

  // 🔥 TITLE STYLE
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // 🔥 DATE STYLE
  if (ws["A2"]) {
    ws["A2"].s = {
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  ws["!cols"] = columns.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};