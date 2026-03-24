import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";
import { createUser } from "../services/userApi";
import { useToast } from "../../../context/ToastContext";
import { Loader } from "../../../components/common";

import type { UserFormData, CreateUserPayload } from "../types";

const UserCreationPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

const handleSubmit = async (
  data: Omit<UserFormData, "confirmPassword">
) => {
  console.log("🔥 PARENT HANDLE SUBMIT", data); // 👈 ADD

  setLoading(true);
  try {
    const payload: CreateUserPayload = {
      userName: data.name.trim(),
      password: data.password,
      email: data.email.trim(),
      isActive: data.active,
      isMaster: data.isMaster,
    };

    console.log("📦 FINAL PAYLOAD", payload); // 👈 ADD

    await createUser(payload);

    showToast("User created successfully 🎉", "success");
    navigate("/dashboard/users");
  } catch (err: any) {
    console.error(err);
    showToast(err.message || "Failed ❌", "error");
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
          <h1 className="text-center text-xl font-bold mb-6">
            USER CREATION
          </h1>

          <UserForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
};

export default UserCreationPage;