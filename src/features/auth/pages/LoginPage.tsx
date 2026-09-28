import { useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { AutoScaleWrapper } from "../../../components/common";
import { ShieldCheck } from "lucide-react";
import bitezoLogo from "../../../assets/bitezo-logo-hq-original.png";

const LoginPage = () => {
  const location = useLocation();
  const onboardingState = location.state as
    | { username?: string; password?: string; message?: string }
    | undefined;

  return (
    <div className="min-h-screen w-full flex flex-col md:grid md:grid-cols-2">
      {/* LEFT SIDE (BRAND & LOGO) */}
      <div className="relative w-full h-52 md:h-full bg-[#1a0f18] flex flex-col items-center justify-center p-6 md:p-12 flex-none md:flex-1 overflow-hidden">
        {/* Ambient brand glow */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#49293e]/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full px-4">
          <img
            src={bitezoLogo}
            alt="Bitezo"
            className="w-52 sm:w-64 md:w-80 max-w-full object-contain brightness-0 invert drop-shadow-lg"
          />

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-widest uppercase shadow-sm">
            <ShieldCheck size={16} className="text-[#f2aedc]" />
            <span>Admin Portal</span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-gray-300/90 font-medium tracking-wide">
            Central Super-Admin &amp; Management Dashboard
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="flex items-center justify-center bg-gray-50/50 px-6 py-10 md:px-12 flex-1">
        <AutoScaleWrapper className="w-full max-w-lg flex flex-col justify-center items-center">
          <div className="w-full">
            {onboardingState?.message && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-base text-emerald-800 shadow-sm">
                {onboardingState.message}
                {onboardingState.username && (
                  <div className="mt-2 font-medium">
                    Username: {onboardingState.username}
                  </div>
                )}
              </div>
            )}
            <LoginForm />
          </div>
        </AutoScaleWrapper>
      </div>
    </div>
  );
};

export default LoginPage;