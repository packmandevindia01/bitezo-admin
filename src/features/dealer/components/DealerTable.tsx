import { Pencil, Plus } from "lucide-react";
import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { Dealer } from "../types";

interface Props {
  dealers: Dealer[];
  onEdit: (dealer: Dealer) => void;
  onAdd: () => void;
}

const DealerTable = ({ dealers, onEdit, onAdd }: Props) => {
  const columns: Column<Dealer>[] = [
    { header: "#", accessor: "dealerId" },
    { header: "Name", accessor: "name" },
    { header: "Mobile", accessor: "mobNo", render: (row) => row.mobNo || "-" },
    { header: "Email", accessor: "email", render: (row) => row.email || "-" },
    { header: "Country", accessor: "country", render: (row) => row.country || "-" },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      accessor: "dealerId",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            title="Edit"
            className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">Dealers</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {dealers.length} record{dealers.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Button onClick={onAdd} className="rounded-lg">
          <Plus size={16} />
          Add Dealer
        </Button>
      </div>
      <Table columns={columns} data={dealers} />
    </div>
  );
};

export default DealerTable;

