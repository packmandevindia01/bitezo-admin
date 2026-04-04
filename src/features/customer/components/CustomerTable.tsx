// src/features/customer/components/CustomerTable.tsx
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { Customer } from "../types";
import { getCountryName } from "../../../utils/countryMapper";

interface Props {
  customers: Customer[];
}

const CustomerTable = ({ customers }: Props) => {
  const navigate = useNavigate();

  const columns: Column<Customer>[] = [
    { header: "#", accessor: "custId" },
    { header: "Name", accessor: "custName" },
    { header: "Mobile", accessor: "custMob" },
    {
      header: "Dealer",
      accessor: "dealerName",
      render: (row) => row.dealerName || (row.dealerId ? String(row.dealerId) : "-"),
    },
    {
      header: "Country",
      accessor: "country",
      render: (row) => getCountryName(row.country),
    },
    { header: "Area", accessor: "area" },
    { header: "Branches", accessor: "branchCount" },
    { header: "Reg ID", accessor: "regId" },
    {
      header: "Version",
      accessor: "version",
      render: (row) => row.version || row.isDemo || "-",
    },
    {
      header: "Actions",
      accessor: "custId",
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <button
            onClick={() => navigate(`/dashboard/customers/edit/${row.custId}`)}
            title="Edit Customer"
            className="
              p-2 rounded-lg
              text-blue-500 bg-blue-50
              hover:bg-blue-500 hover:text-white
              transition-all duration-200 hover:scale-110 hover:shadow-md
            "
          >
            <Pencil size={18} />
          </button>

          {/* Delete */}
          <button
            title="Delete Customer"
            className="
              p-2 rounded-lg
              text-red-500 bg-red-50
              hover:bg-red-500 hover:text-white
              transition-all duration-200 hover:scale-110 hover:shadow-md
            "
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={customers} />;
};

export default CustomerTable;
