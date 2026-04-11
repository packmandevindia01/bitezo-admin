import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common";
import { useToast } from "../../../context/ToastContext";
import EmailForm from "../components/EmailForm";
import OtpForm from "../components/OtpForm";
import {
  checkAdminExistsApi,
  sendOtpApi,
  verifyOtpApi,
} from "../services/authApi";

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
      }

      if ("title" in data && typeof data.title === "string" && data.title.trim()) {
        return data.title.trim();
      }
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [otpError, setOtpError] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const sendOtp = async (targetEmail: string, isResend = false) => {
    if (isResend) {
      setResendingOtp(true);
    } else {
      setSendingOtp(true);
    }

    try {
      await sendOtpApi(targetEmail);
      setEmail(targetEmail.trim().toLowerCase());
      setStep("otp");
      setOtpError("");
      setOtpResetKey((prev) => prev + 1);
      showToast(isResend ? "OTP resent successfully" : "OTP sent successfully", "success");
    } catch (error) {
      const message = resolveErrorMessage(error, "Failed to send OTP");
      setOtpError(message);
      showToast(message, "error");
    } finally {
      if (isResend) {
        setResendingOtp(false);
      } else {
        setSendingOtp(false);
      }
    }
  };

  const handleEmailSubmit = async (submittedEmail: string) => {
    await sendOtp(submittedEmail);
  };

  const handleVerifyOtp = async (otp: string) => {
    setVerifyingOtp(true);
    setOtpError("");

    try {
      const otpToken = await verifyOtpApi(email, otp.trim());

      if (!otpToken) {
        throw new Error("OTP verified, but no OTP token was returned");
      }

      const adminExists = await checkAdminExistsApi(email, otpToken);

      if (adminExists) {
        showToast("Admin already exists. Please log in.", "success");
        navigate("/", {
          replace: true,
          state: { onboardingEmail: email },
        });
        return;
      }

      showToast("OTP verified. Continue with company creation.", "success");
      navigate("/onboarding/company", {
        state: {
          onboarding: true,
          email,
          otpToken,
        },
      });
    } catch (error) {
      const message = resolveErrorMessage(error, "Failed to verify OTP");
      setOtpError(message);
      showToast(message, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-[#49293e]">
          Admin Onboarding
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Verify your email first. If an admin already exists, we will send you to login.
        </p>

        {step === "email" ? (
          <EmailForm onSubmit={(submittedEmail) => void handleEmailSubmit(submittedEmail)} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Enter the OTP sent to <span className="font-medium">{email}</span>
            </p>

            <OtpForm
              onSubmit={handleVerifyOtp}
              onResend={() => sendOtp(email, true)}
              loading={verifyingOtp}
              resendLoading={resendingOtp}
              errorMessage={otpError}
              resetKey={`${email}-${otpResetKey}`}
            />

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setStep("email");
                setOtpError("");
              }}
              disabled={verifyingOtp || sendingOtp || resendingOtp}
            >
              Change Email
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already onboarded?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-medium text-[#49293e] hover:underline"
          >
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
