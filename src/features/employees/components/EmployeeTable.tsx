import { Pencil, Trash2 } from "lucide-react";
import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { Employee } from "../types";

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const EmployeeTable = ({ employees, onEdit, onDelete, onAdd }: Props) => {
  const columns: Column<Employee>[] = [
    { header: "#", accessor: "empId" },
    { header: "Name", accessor: "name" },
    {
      header: "Dealer",
      accessor: "dealerId",
      render: (row) => row.dealer || String(row.dealerId || "-"),
    },
    { header: "Mobile", accessor: "mobNo", render: (row) => row.mobNo || "-" },
    { header: "Email", accessor: "email", render: (row) => row.email || "-" },
    { header: "Country", accessor: "country" },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      accessor: "empId",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            title="Edit"
            className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(row.empId)}
            title="Delete"
            className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Employees</h2>
        <Button onClick={onAdd}>+ Add Employee</Button>
      </div>
      <Table columns={columns} data={employees} />
    </div>
  );
};

export default EmployeeTable;
