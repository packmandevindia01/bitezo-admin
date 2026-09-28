import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormInput, Button } from "../../../components/common";
import { loginApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/authSlice";
import type { AppDispatch } from "../../../store/store";
import { User, Lock } from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  useEffect(() => {
    const state = location.state as
      | {
          onboardingComplete?: boolean;
          onboardingEmail?: string;
        }
      | undefined;

    if (state?.onboardingEmail) {
      setUsername(state.onboardingEmail);
    }

    if (state?.onboardingComplete) {
      showToast("Company created successfully. Please log in.", "success");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { username: "", password: "" };
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({ username: "", password: "" });

    try {
      setLoading(true);

      const data = await loginApi(username, password);

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Login failed");
      }

      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          sessionExpiresAt: data.session?.expiresAt,
          user: {
            userId: data.user.userId,
            userName: data.user.userName,
            email: data.user.email ?? "",
            isMaster: Boolean(data.user.isMaster),
          },
        })
      );

      showToast("Login successful", "success");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid username or password";

      showToast(message, "error");

      setUsername("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full rounded-2xl bg-white p-8 sm:p-10 shadow-xl border border-gray-100/80"
    >
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-[#49293e] tracking-tight">
        Admin Login
      </h2>
      <p className="mt-1.5 mb-7 text-center text-xs sm:text-sm text-gray-500 font-medium">
        Enter your credentials to access the admin portal
      </p>

      <div className="space-y-4">
        <FormInput
          id="login-username"
          type="text"
          label="Username"
          placeholder="Enter your username"
          icon={<User size={18} />}
          inputClassName="!h-12 !text-base !rounded-xl font-medium focus:!border-[#49293e] !pl-11"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              document.getElementById("login-password")?.focus();
            }
          }}
          error={errors.username}
          autoFocus
          tabIndex={1}
        />

        <FormInput
          id="login-password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          icon={<Lock size={18} />}
          inputClassName="!h-12 !text-base !rounded-xl font-medium focus:!border-[#49293e] !pl-11 !pr-11"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          error={errors.password}
          tabIndex={2}
        />
      </div>

      <button
        type="button"
        onClick={() => navigate("/forgot-password")}
        tabIndex={-1}
        className="mt-3 mb-6 block w-full text-right cursor-pointer text-sm font-semibold text-gray-500 hover:text-[#49293e] hover:underline bg-transparent border-none outline-none transition-colors"
      >
        Forgot Password?
      </button>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={loading}
        tabIndex={3}
        className="!h-12 !text-base font-bold !rounded-xl bg-[#49293e] hover:bg-[#49293e]/90 transition-all shadow-md active:scale-[0.99]"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
