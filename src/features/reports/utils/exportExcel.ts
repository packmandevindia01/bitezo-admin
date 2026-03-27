import ExcelJS from "exceljs";
import { formatDate } from "./reportHelpers";

export const generateExcel = async (
  title: string,
  columns: string[],
  rows: any[][],
  fileName: string
) => {
  const formattedDate = formatDate(new Date());
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  const lastCol = columns.length;

  // ✅ TITLE ROW
  ws.addRow([title]);
  ws.mergeCells(1, 1, 1, lastCol);
  const titleCell = ws.getCell("A1");
  titleCell.font = { bold: true, size: 14, name: "Arial" };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // ✅ DATE ROW
  ws.addRow([`Date: ${formattedDate}`]);
  ws.mergeCells(2, 1, 2, lastCol);
  const dateCell = ws.getCell("A2");
  dateCell.font = { size: 11, name: "Arial" };
  dateCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  // ✅ EMPTY ROW
  ws.addRow([]);

  // ✅ HEADER ROW (row 4)
  const headerRow = ws.addRow(columns);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, name: "Arial" };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8D5C4" }, // light brand color
    };
  });
  headerRow.height = 22;

  // ✅ DATA ROWS
  rows.forEach((row) => {
    const dataRow = ws.addRow(row);
    dataRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { size: 10, name: "Arial" };
    });
    dataRow.height = 18;
  });

  // ✅ COLUMN WIDTHS
  ws.columns = columns.map(() => ({ width: 22 }));

  // ✅ DOWNLOAD
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};