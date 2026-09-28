import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers } from "../../../store/userSlice";
import { createUser, updateUser, changePassword } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";
import type {
  User,
  UserFormData,
  CreateUserPayload,
  UpdateUserPayload,
  UpdatePasswordPayload,
} from "../types";

export const useUserManager = () => {
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { list: users, loading } = useSelector(
    (state: RootState) => state.users
  );

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null) {
      const maybe = err as {
        response?: { data?: { message?: string } | string };
        message?: string;
      };
      if (typeof maybe.response?.data === "string") return maybe.response.data;
      if (maybe.response?.data?.message) return maybe.response.data.message;
      if (maybe.message) return maybe.message;
    }
    return "Operation failed";
  };

  const getPasswordChangeErrorMessage = (err: unknown): string => {
    if (typeof err === "object" && err !== null) {
      const maybe = err as {
        response?: {
          status?: number;
          data?:
            | {
                message?: string;
                error?: string;
                title?: string;
                detail?: string;
                errors?: Record<string, string[] | string>;
              }
            | string;
        };
        message?: string;
      };

      const status = maybe.response?.status;
      const data = maybe.response?.data;

      // Check string response
      if (typeof data === "string") {
        const trimmed = data.trim();
        if (
          /operation failed/i.test(trimmed) ||
          /current.*password/i.test(trimmed) ||
          /incorrect/i.test(trimmed) ||
          /invalid.*password/i.test(trimmed) ||
          /wrong.*password/i.test(trimmed) ||
          /password.*not match/i.test(trimmed) ||
          /bad request/i.test(trimmed)
        ) {
          return "Current password is incorrect.";
        }
        if (trimmed.length > 0 && !/^request failed/i.test(trimmed)) {
          return trimmed;
        }
      }

      // Check object response
      if (typeof data === "object" && data !== null) {
        const rawMsg = data.message || data.error || data.detail;
        if (typeof rawMsg === "string" && rawMsg.trim().length > 0) {
          if (
            /operation failed/i.test(rawMsg) ||
            /current.*password/i.test(rawMsg) ||
            /incorrect/i.test(rawMsg) ||
            /invalid.*password/i.test(rawMsg) ||
            /wrong.*password/i.test(rawMsg) ||
            /password.*not match/i.test(rawMsg)
          ) {
            return "Current password is incorrect.";
          }
          return rawMsg;
        }

        if (data.errors && typeof data.errors === "object") {
          for (const [key, val] of Object.entries(data.errors)) {
            const msg = Array.isArray(val) ? val[0] : String(val);
            if (msg) {
              if (
                /current/i.test(key) ||
                /password/i.test(key) ||
                /operation failed/i.test(msg) ||
                /incorrect/i.test(msg)
              ) {
                return "Current password is incorrect.";
              }
              return msg;
            }
          }
        }

        if (data.title && typeof data.title === "string") {
          if (
            /operation failed/i.test(data.title) ||
            /current.*password/i.test(data.title) ||
            /incorrect/i.test(data.title) ||
            /one or more validation errors/i.test(data.title)
          ) {
            return "Current password is incorrect.";
          }
        }
      }

      // If client or Axios error message mentions password or operation failed
      if (typeof maybe.message === "string") {
        if (
          /operation failed/i.test(maybe.message) ||
          /current.*password/i.test(maybe.message) ||
          /incorrect/i.test(maybe.message)
        ) {
          return "Current password is incorrect.";
        }
      }

      if (status === 400 || status === 401) {
        return "Current password is incorrect.";
      }

      if (status === 404) {
        return "User not found.";
      }
    }

    return "Current password is incorrect.";
  };

  const handleCreate = async (data: UserFormData) => {
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
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to create ❌", "error");
    }
  };

  const handleEdit = useCallback((user: User) => {
    setEditUser(user);
    setEditOpen(true);
  }, []);

  const handleEditSubmit = async (data: UserFormData) => {
    if (!editUser) return;
    try {
      const payload: UpdateUserPayload = {
        userId: editUser.id,
        userName: data.name.trim(),
        email: data.email.trim(),
        isActive: data.active,
        isMaster: data.isMaster,
      };
      await updateUser(payload);
      showToast("User updated successfully ✏️", "success");
      dispatch(fetchUsers());
      setEditOpen(false);
      setEditUser(null);
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "Failed to update ❌", "error");
    }
  };

  const handlePasswordChange = async (data: UpdatePasswordPayload) => {
    if (!passwordUser) return;
    setPasswordLoading(true);
    setPasswordError(null);
    try {
      await changePassword(passwordUser.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showToast("Password updated successfully 🔑", "success");
      setPasswordOpen(false);
      setPasswordUser(null);
      setPasswordError(null);
    } catch (err: unknown) {
      const errorMsg = getPasswordChangeErrorMessage(err);
      setPasswordError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const confirmDelete = useCallback(() => {
    if (deleteId !== null) {
      showToast("User deleted ⚠️", "info");
      dispatch(fetchUsers());
      setDeleteId(null);
    }
  }, [deleteId, dispatch, showToast]);

  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditUser(null);
  }, []);

  const openPasswordChange = useCallback((user: User) => {
    setPasswordUser(user);
    setPasswordError(null);
    setPasswordOpen(true);
  }, []);

  const closePasswordChange = useCallback(() => {
    setPasswordOpen(false);
    setPasswordUser(null);
    setPasswordError(null);
  }, []);

  const openDelete = useCallback((id: number) => setDeleteId(id), []);
  const closeDelete = useCallback(() => setDeleteId(null), []);

  return {
    users,
    loading,
    editUser,
    editOpen,
    createOpen,
    deleteId,
    passwordUser,
    passwordOpen,
    passwordError,
    passwordLoading,
    setPasswordError,
    openCreate,
    closeCreate,
    openEdit: handleEdit,
    closeEdit,
    openPasswordChange,
    closePasswordChange,
    openDelete,
    closeDelete,
    handleCreate,
    handleEditSubmit,
    handlePasswordChange,
    confirmDelete,
    refetchUsers: () => dispatch(fetchUsers()),
  };
};
