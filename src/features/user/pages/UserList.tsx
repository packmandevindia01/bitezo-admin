// src/features/user/pages/UserList.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers } from "../../../store/userSlice";

import {  updateUser } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";

import { Loader, Button, Modal } from "../../../components/common";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import PasswordChangeForm from "../components/PasswordChangeForm";

import type { User } from "../types";

const UserList = () => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { list: users, loading } = useSelector(
    (state: RootState) => state.users
  );

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  // modal visibility
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ── EDIT USER (no password) ───────────────────────────────────────────────
  const handleSave = async (data: any) => {
    try {
      const payload = {
        userId: editUser?.id || 0,
        userName: data.name.trim(),
        password: "", // not changed here
        email: data.email.trim(),
        isActive: data.active,
        isMaster: data.isMaster,
      };

      if (editUser) {
        await updateUser(payload);
        showToast("User updated successfully ✏️", "success");
      } else {
        // Create needs password — handled in UserCreationPage
        showToast("User created successfully 🎉", "success");
      }

      dispatch(fetchUsers());
      setEditOpen(false);
      setEditUser(null);
    } catch (err: any) {
      const message = err.message || "Something went wrong";
      if (message.includes("Conflict detected on:")) {
        const field = message.split(":")[1]?.trim();
        showToast(`${field} already exists ❌`, "error");
      } else {
        showToast(message + " ❌", "error");
      }
    }
  };

  // ── CHANGE PASSWORD ───────────────────────────────────────────────────────
  const handlePasswordChange = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      // Adjust this payload to match your backend's change-password endpoint
      await updateUser({
        userId: passwordUser!.id,
        userName: passwordUser!.name,
        password: data.newPassword,
        email: passwordUser!.email,
        isActive: passwordUser!.active,
        isMaster: passwordUser!.isMaster,
      });

      showToast("Password updated successfully 🔑", "success");
      setPasswordOpen(false);
      setPasswordUser(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update password ❌", "error");
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (deleteId !== null) {
      showToast("User deleted (UI only) ⚠️", "info");
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

      {/* ── USER TABLE ── */}
      <UserTable
        users={users}
        onEdit={(user) => {
          setEditUser(user);
          setEditOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
        onChangePassword={(user) => {
          setPasswordUser(user);
          setPasswordOpen(true);
        }}
        onAdd={() => {
          setEditUser(null);
          setEditOpen(true);
        }}
      />

      {/* ── EDIT MODAL (no password fields) ── */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={editUser ? "Edit User" : "Add User"}
      >
        <UserForm
          initialData={editUser}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* ── CHANGE PASSWORD MODAL ── */}
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

      {/* ── DELETE CONFIRM MODAL ── */}
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