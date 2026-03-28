import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";
import { createUser } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";
import { Loader } from "../../../components/common";
import type { CreateUserPayload, UserFormData } from "../types";

const UserCreationPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);
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
      navigate("/dashboard/users");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard/users")}
            isEdit={false} // 👈 shows password fields
          />
        </div>
      </div>
    </>
  );
};

export default UserCreationPage;