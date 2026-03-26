import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "./reportHelpers";

export const generatePDF = (
  title: string,
  columns: string[],
  rows: any[][],
  fileName: string
) => {
  const doc = new jsPDF();

  const formattedDate = formatDate(new Date());

  // 🔥 TITLE
  doc.setFontSize(14); // ↓ reduced
  doc.text(title, 105, 15, { align: "center" });

  // 🔥 DATE
  doc.setFontSize(9); // ↓ reduced
  doc.text(`Date: ${formattedDate}`, 105, 22, { align: "center" });

  // 🔥 TABLE
  autoTable(doc, {
    startY: 28,

    head: [columns],
    body: rows,

    styles: {
      fontSize: 2, // 🔥 REDUCED FONT SIZE
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fontSize: 6,
      halign: "center",
      fillColor: [41, 41, 41],
      textColor: 255,
    },

    bodyStyles: {
      fontSize: 4,
      halign: "center",
    },
  });

  doc.save(`${fileName}.pdf`);
};