import { useState } from "react";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import { Button, Modal } from "../../../components/common";
import type { User } from "../types";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John",
      email: "john@mail.com",
      branch: "Calicut",
      active: true,
      isMaster: false,
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ SAVE (ADD / EDIT)
  const handleSave = (data: Omit<User, "id">) => {
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...data, id: u.id } : u
        )
      );
    } else {
      setUsers((prev) => [
        ...prev,
        { ...data, id: Date.now() },
      ]);
    }

    setOpen(false);
    setEditUser(null);
  };



  const confirmDelete = () => {
  if (deleteId !== null) {
    setUsers((prev) => prev.filter((u) => u.id !== deleteId));
    setDeleteId(null);
  }
};

  return (
    <>
      <UserTable
        users={users}
        onEdit={(user) => {
          setEditUser(user);
          setOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
        onAdd={() => {
          setEditUser(null);
          setOpen(true);
        }}
      />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="User"
      >
        <UserForm
          initialData={editUser}
          onSubmit={handleSave}
          onCancel={() => setOpen(false)}
        />
      </Modal>
      <Modal
  isOpen={deleteId !== null}
  onClose={() => setDeleteId(null)}
  title="Confirm Delete"
>
  <div className="text-center space-y-4">
    <p className="text-gray-700">
      Are you sure you want to delete this user?
    </p>

    <div className="flex justify-center gap-3">
      <Button variant="secondary" onClick={() => setDeleteId(null)}>
        Cancel
      </Button>

      <Button variant="danger" onClick={confirmDelete}>
        Delete
      </Button>
    </div>
  </div>
</Modal>
    </>
  );
};

export default UserList;