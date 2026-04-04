import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormInput, Button } from "../../../components/common";
import { loginApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/authSlice";
import type { AppDispatch } from "../../../store/store";

const LoginForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

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
            email: data.user.email,
            isMaster: data.user.isMaster,
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
      className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md mx-auto"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-[#49293e]">
        Login
      </h2>

      <FormInput
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setErrors((prev) => ({ ...prev, username: "" }));
        }}
        error={errors.username}
      />

      <FormInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors((prev) => ({ ...prev, password: "" }));
        }}
        error={errors.password}
      />

      <p
        onClick={() => navigate("/forgot-password")}
        className="text-sm text-right mt-2 mb-4 text-gray-600 cursor-pointer hover:underline"
      >
        Forgot Password?
      </p>

      <Button type="submit" size="lg" fullWidth disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
