import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers } from "../../../store/userSlice";
import { updateUser, changePassword, createUser } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";

import { Loader, Button, Modal } from "../../../components/common";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import PasswordChangeForm from "../components/PasswordChangeForm";

import type { User, CreateUserPayload } from "../types";

const UserList = () => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { list: users, loading } = useSelector(
    (state: RootState) => state.users
  );

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false); // 👈 new
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ── CREATE USER ───────────────────────────────────────────────────────────
  const handleCreate = async (data: any) => {
    try {
      const payload: CreateUserPayload = {
        userName: data.name.trim(),
        password: data.password,
        email: data.email.trim(),
        isActive: data.active,
        isMaster: data.isMaster,
      };
      await createUser(payload);
      showToast("User created successfully 🎉", "success");
      dispatch(fetchUsers());
      setCreateOpen(false);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create ❌", "error");
    }
  };

  // ── EDIT USER ─────────────────────────────────────────────────────────────
  const handleEditSubmit = async (data: any) => {
    if (!editUser) return;
    try {
      await updateUser({
        userId: editUser.id,
        userName: data.name.trim(),
        email: data.email.trim(),
        isActive: data.active,
        isMaster: data.isMaster,
      });
      showToast("User updated successfully ✏️", "success");
      dispatch(fetchUsers());
      setEditOpen(false);
      setEditUser(null);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update ❌", "error");
    }
  };

  // ── CHANGE PASSWORD ───────────────────────────────────────────────────────
  const handlePasswordChange = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await changePassword(passwordUser!.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showToast("Password updated successfully 🔑", "success");
      setPasswordOpen(false);
      setPasswordUser(null);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update password ❌", "error");
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (deleteId !== null) {
      showToast("User deleted ⚠️", "info");
      dispatch(fetchUsers());
      setDeleteId(null);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      {/* USER TABLE */}
      <UserTable
        users={users}
        onEdit={(user) => { setEditUser(user); setEditOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
        onChangePassword={(user) => { setPasswordUser(user); setPasswordOpen(true); }}
        onAdd={() => setCreateOpen(true)} // 👈 opens modal instead of page
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add User"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isEdit={false}
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditUser(null); }}
        title={`Edit User — ${editUser?.name ?? ""}`}
      >
        <UserForm
          initialData={editUser}
          onSubmit={handleEditSubmit}
          onCancel={() => { setEditOpen(false); setEditUser(null); }}
          isEdit={true}
        />
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title={`Change Password — ${passwordUser?.name ?? ""}`}
      >
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          onCancel={() => setPasswordOpen(false)}
        />
      </Modal>

      {/* DELETE CONFIRM MODAL */}
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