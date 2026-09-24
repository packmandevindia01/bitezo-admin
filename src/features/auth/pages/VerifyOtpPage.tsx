import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OtpForm from "../components/OtpForm";
import { verifyOtpApi, sendOtpApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const email = location.state?.email as string | undefined;

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const handleVerifyOtp = async (otp: string) => {
    if (!email) {
      showToast("Email not found. Please go back and try again.", "error");
      return;
    }
    try {
      setLoading(true);
      setErrorMessage("");
      const otpToken = await verifyOtpApi(email, otp);
      showToast("OTP verified successfully", "success");
      navigate("/reset-password", { state: { email, otpToken } });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid OTP. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setResendLoading(true);
      await sendOtpApi(email);
      showToast("OTP resent to your email", "success");
      setResetKey((k) => k + 1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend OTP.";
      showToast(message, "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-[#49293e]">
          Verify OTP
        </h2>
        {email && (
          <p className="text-sm text-gray-600 text-center mb-4">
            OTP sent to <span className="font-medium">{email}</span>
          </p>
        )}
        <OtpForm
          onSubmit={handleVerifyOtp}
          onResend={handleResend}
          loading={loading}
          resendLoading={resendLoading}
          errorMessage={errorMessage}
          resetKey={resetKey}
        />
      </div>
    </div>
  );
};

export default VerifyOtpPage;