import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { resetPasswordApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const email = location.state?.email as string | undefined;
  const otpToken = location.state?.otpToken as string | undefined;

  const handleReset = async (password: string) => {
    if (!email || !otpToken) {
      showToast("Session expired. Please start the forgot password process again.", "error");
      navigate("/forgot-password");
      return;
    }
    try {
      setLoading(true);
      await resetPasswordApi(email, otpToken, password);
      showToast("Password reset successful. Please log in.", "success");
      navigate("/", { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-[#49293e]">
          Reset Password
        </h2>
        <ResetPasswordForm onSubmit={handleReset} loading={loading} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;