import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/common";
import CustomerForm from "../components/CustomerForm";

const CustomerRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingState = location.state as
    | {
        onboarding?: boolean;
        email?: string;
        otpToken?: string;
      }
    | undefined;
  const isOnboarding = location.pathname === "/onboarding/company";

  useEffect(() => {
    if (!isOnboarding) return;

    if (!onboardingState?.email || !onboardingState?.otpToken) {
      navigate("/onboarding", { replace: true });
    }
  }, [isOnboarding, navigate, onboardingState?.email, onboardingState?.otpToken]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-6xl bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md">
        {!isOnboarding && (
          <div className="mb-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard/customers")}
            >
              Back
            </Button>
          </div>
        )}

        <h1 className="text-center text-xl sm:text-2xl font-bold mb-6 md:mb-8">
          {isOnboarding ? "CREATE COMPANY" : "CUSTOMER REGISTRATION"}
        </h1>

        <CustomerForm
          mode={isOnboarding ? "onboarding" : "dashboard"}
          initialEmail={isOnboarding ? onboardingState?.email : undefined}
          initialOtpToken={isOnboarding ? onboardingState?.otpToken : undefined}
        />

      </div>
    </div>
  );
};

export default CustomerRegistrationPage;
