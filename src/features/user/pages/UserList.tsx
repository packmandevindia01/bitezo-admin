import { useState } from "react";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import { Button, Modal } from "../../../components/common";
import type { User } from "../types";
import { createUser } from "../services/userApi";
import type { CreateUserPayload } from "../types";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John",
      email: "john@mail.com",
     
      active: true,
      isMaster: false,
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ SAVE (ADD / EDIT)
 const handleSave = async (data: any) => {
  try {
    const payload: CreateUserPayload = {
      userName: data.name.trim(),
      password: data.password,
      email: data.email.trim(),
      isActive: data.active,
      isMaster: data.isMaster,
    };

    console.log("📦 PAYLOAD", payload);

    const res = await createUser(payload);

    console.log("✅ API RESPONSE", res);

    // OPTIONAL: update UI after API
    setUsers((prev) => [
      ...prev,
      {
        id: res.data.id,
        name: data.name,
        email: data.email,
        active: data.active,
        isMaster: data.isMaster,
      },
    ]);

    setOpen(false);
    setEditUser(null);
  } catch (err: any) {
    console.error("❌ API ERROR", err);
  }
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