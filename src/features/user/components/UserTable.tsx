import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { User } from "../types";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const UserTable = ({ users, onEdit, onDelete, onAdd }: Props) => {
 const columns: Column<User>[] = [
  { header: "#", accessor: "id" },

  { header: "User Name", accessor: "name" },

  {
    header: "Email",
    accessor: "email",
    render: (row) => row.email || "-",
  },

  {
    header: "Status",
    accessor: "active",
    render: (row) => (
      <StatusBadge status={row.active ? "active" : "inactive"} />
    ),
  },

  {
    header: "Actions",
    accessor: "id",
    render: (row) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onEdit(row)}>
          Edit
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(row.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];
  console.log("TABLE USERS:", users);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Users</h2>

        <Button onClick={onAdd}>+ Add User</Button>
      </div>

      {/* EMPTY STATE */}
      {!users.length ? (
        <div className="text-center py-6 text-gray-500">
          No users found
        </div>
      ) : (
        <Table columns={columns} data={users} />
      )}
    </div>
  );
};

export default UserTable;