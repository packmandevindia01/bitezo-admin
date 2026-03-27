// src/features/user/components/UserTable.tsx
import { Pencil, Trash2, KeyRound } from "lucide-react";
import { Table, Button, StatusBadge } from "../../../components/common";
import type { Column } from "../../../components/common/Table";
import type { User } from "../types";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onChangePassword: (user: User) => void;
  onAdd: () => void;
}

const UserTable = ({ users, onEdit, onDelete, onChangePassword, onAdd }: Props) => {
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
        <div className="flex items-center gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(row)}
            title="Edit User"
            className="
              p-2 rounded-lg
              text-blue-500 bg-blue-50
              hover:bg-blue-500 hover:text-white
              transition-all duration-200 hover:scale-110 hover:shadow-md
            "
          >
            <Pencil size={18} />
          </button>

          {/* Change Password */}
          <button
            onClick={() => onChangePassword(row)}
            title="Change Password"
            className="
              p-2 rounded-lg
              text-amber-500 bg-amber-50
              hover:bg-amber-500 hover:text-white
              transition-all duration-200 hover:scale-110 hover:shadow-md
            "
          >
            <KeyRound size={18} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(row.id)}
            title="Delete User"
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Users</h2>
        <Button onClick={onAdd}>+ Add User</Button>
      </div>

      {!users.length ? (
        <div className="text-center py-6 text-gray-500">No users found</div>
      ) : (
        <Table columns={columns} data={users} />
      )}
    </div>
  );
};

export default UserTable;