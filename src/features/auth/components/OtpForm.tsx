import { useState, useEffect } from "react";
import { Button } from "../../../components/common";
import OtpInput from "./OtpInput";

interface Props {
  onSubmit: (otp: string) => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  loading?: boolean;
  resendLoading?: boolean;
  submitLabel?: string;
  helperText?: string;
  errorMessage?: string;
  resetKey?: string | number;
}

const OtpForm = ({
  onSubmit,
  onResend,
  loading = false,
  resendLoading = false,
  submitLabel = "Verify OTP",
  helperText,
  errorMessage = "",
  resetKey,
}: Props) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  // ⏱ TIMER
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setTimer(30);
  }, [resetKey]);

  const handleSubmit = () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Enter complete OTP");
      return;
    }

    setError("");
    onSubmit(otpValue);
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    onResend?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {helperText && (
        <p className="text-sm text-gray-600 text-center">{helperText}</p>
      )}

      {/* OTP BOXES */}
      <OtpInput value={otp} onChange={setOtp} />

      {(error || errorMessage) && (
        <p className="text-red-500 text-sm text-center">{error || errorMessage}</p>
      )}

      {/* VERIFY BUTTON */}
      <Button onClick={handleSubmit} className="w-full" loading={loading}>
        {submitLabel}
      </Button>

      {/* RESEND */}
      <div className="text-center text-sm text-gray-600">
        {timer > 0 ? (
          <p>Resend in {timer}s</p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-[#49293e] font-medium hover:underline"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

    </div>
  );
};

export default OtpForm;
