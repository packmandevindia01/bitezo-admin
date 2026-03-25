import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers } from "../../../store/userSlice";

import { createUser, updateUser } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";

import { Loader, Button, Modal } from "../../../components/common";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";

import type { User } from "../types";

const UserList = () => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  // 🔥 Redux state
  const { list: users, loading } = useSelector(
    (state: RootState) => state.users
  );

  // 🔥 Local UI state
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ Fetch users on load
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ✅ CREATE / UPDATE
  const handleSave = async (data: any) => {
    try {
      const payload = {
        userId: editUser?.id || 0,
        userName: data.name.trim(),
        password: data.password,
        email: data.email.trim(),
        isActive: data.active,
        isMaster: data.isMaster,
      };

      console.log("📦 PAYLOAD", payload);

      if (editUser) {
        await updateUser(payload);
        showToast("User updated successfully ✏️", "success");
      } else {
        await createUser(payload);
        showToast("User created successfully 🎉", "success");
      }

      // 🔥 Refresh Redux list
      dispatch(fetchUsers());

      setOpen(false);
      setEditUser(null);
    } catch (err: any) {
      console.error("❌ API ERROR", err);

      let message = err.message || "Something went wrong";

      if (message.includes("Conflict detected on:")) {
        let field = message.split(":")[1]?.trim();
        showToast(`${field} already exists ❌`, "error");
      } else {
        showToast(message + " ❌", "error");
      }
    }
  };

  // ✅ DELETE (UI only for now)
  const confirmDelete = () => {
    if (deleteId !== null) {
      showToast("User deleted (UI only) ⚠️", "info");

      dispatch(fetchUsers()); // or filter locally if needed
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* 🔥 Loader (non-blocking) */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      {/* ✅ USER TABLE */}
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

      {/* ✅ CREATE / EDIT MODAL */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editUser ? "Edit User" : "Add User"}
      >
        <UserForm
          initialData={editUser}
          onSubmit={handleSave}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      {/* ✅ DELETE CONFIRM MODAL */}
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
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
            >
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