import { useNavigate } from "react-router-dom";
import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { Customer } from "../types";

interface Props {
  customers: Customer[];
}

const CustomerTable = ({ customers }: Props) => {
  const navigate = useNavigate();
  const columns: Column<Customer>[] = [
    { header: "#", accessor: "custId" },
    { header: "Name", accessor: "custName" },
    { header: "Mobile", accessor: "custMob" },
    { header: "Country", accessor: "country" },
    { header: "Area", accessor: "area" },
    { header: "Branches", accessor: "branchCount" },
    { header: "Reg ID", accessor: "regId" },

    {
      header: "Demo",
      accessor: "isDemo",
      render: (row) => (
        <StatusBadge
          status={row.isDemo === "Demo" ? "active" : "inactive"}
        />
      ),
    },

    {
      header: "Actions",
      accessor: "custId",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate(`/dashboard/customers/edit/${row.custId}`)}>
            Edit
          </Button>
          <Button size="sm" variant="danger">
            Delete
          </Button>
        </div>
      )
    },
  ];

  return <Table columns={columns} data={customers} />;
};

export default CustomerTable;