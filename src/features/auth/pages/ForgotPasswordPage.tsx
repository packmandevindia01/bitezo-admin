import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailForm from "../components/EmailForm";
import { sendOtpApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (email: string) => {
    try {
      setLoading(true);
      await sendOtpApi(email);
      showToast("OTP sent to your email", "success");
      navigate("/verify-otp", { state: { email } });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-[#49293e]">
          Forgot Password
        </h2>
        <EmailForm onSubmit={handleEmailSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;