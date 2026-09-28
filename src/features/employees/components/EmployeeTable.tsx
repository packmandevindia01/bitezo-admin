import { useState, useMemo } from "react";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { Employee } from "../types";

interface Props {
  employees: Employee[];
  loading?: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

type SortField = "empId" | "name" | "dealer" | "country" | "status" | null;
type SortOrder = "asc" | "desc";

const EmployeeTable = ({ employees, loading, onEdit, onDelete, onAdd }: Props) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(null);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedEmployees = useMemo(() => {
    if (!sortField) return employees;

    return [...employees].sort((a, b) => {
      let result = 0;
      if (sortField === "dealer") {
        const dealerA = (a.dealer?.trim() || (a.dealerId ? String(a.dealerId) : "")).toLowerCase();
        const dealerB = (b.dealer?.trim() || (b.dealerId ? String(b.dealerId) : "")).toLowerCase();
        if (!dealerA && dealerB) return 1;
        if (dealerA && !dealerB) return -1;
        result = dealerA.localeCompare(dealerB, undefined, { numeric: true, sensitivity: "base" });
      } else if (sortField === "name") {
        const nameA = (a.name?.trim() || "").toLowerCase();
        const nameB = (b.name?.trim() || "").toLowerCase();
        result = nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
      } else if (sortField === "empId") {
        result = (a.empId || 0) - (b.empId || 0);
      } else if (sortField === "country") {
        const countryA = (a.country?.trim() || "").toLowerCase();
        const countryB = (b.country?.trim() || "").toLowerCase();
        result = countryA.localeCompare(countryB, undefined, { numeric: true, sensitivity: "base" });
      } else if (sortField === "status") {
        const statusA = a.isActive ? 1 : 0;
        const statusB = b.isActive ? 1 : 0;
        result = statusA - statusB;
      }
      return sortOrder === "asc" ? result : -result;
    });
  }, [employees, sortField, sortOrder]);

  const renderSortHeader = (label: string, field: SortField) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="inline-flex items-center justify-center gap-1.5 hover:text-[#49293e] transition-colors cursor-pointer select-none group"
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      {sortField === field ? (
        sortOrder === "asc" ? (
          <ArrowUp size={13} className="text-[#49293e]" />
        ) : (
          <ArrowDown size={13} className="text-[#49293e]" />
        )
      ) : (
        <ArrowUpDown size={13} className="text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );

  const columns: Column<Employee>[] = [
    {
      header: renderSortHeader("#", "empId"),
      accessor: "empId",
    },
    {
      header: renderSortHeader("Name", "name"),
      accessor: "name",
      render: (row) => (
        <span className="inline-block max-w-[200px] truncate" title={row.name}>
          {row.name || "-"}
        </span>
      ),
    },
    {
      header: renderSortHeader("Dealer", "dealer"),
      accessor: "dealerId",
      render: (row) => {
        const dealerName = (row.dealer && row.dealer.trim()) || (row.dealerId ? String(row.dealerId) : "-");
        return (
          <span className="inline-block max-w-[180px] truncate" title={dealerName}>
            {dealerName}
          </span>
        );
      },
    },
    {
      header: "Mobile",
      accessor: "mobNo",
      render: (row) => row.mobNo || "-",
    },
    {
      header: "Email",
      accessor: "email",
      render: (row) => (
        <span className="inline-block max-w-[200px] truncate" title={row.email}>
          {row.email || "-"}
        </span>
      ),
    },
    {
      header: renderSortHeader("Country", "country"),
      accessor: "country",
      render: (row) => row.country || "-",
    },
    {
      header: renderSortHeader("Status", "status"),
      accessor: "isActive",
      render: (row) => (
        <StatusBadge
          status={row.isActive ? "active" : "inactive"}
          label={row.isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: "empId",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
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
      <Table columns={columns} data={sortedEmployees} loading={loading} rowKey="empId" />
    </div>
  );
};

export default EmployeeTable;
