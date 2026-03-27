import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormInput, Button } from "../../../components/common";
import { loginApi } from "../services/authApi";
import { useToast } from "../../../context/ToastContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please enter username and password", "error");
      return;
    }

    try {
      setLoading(true);

      const data = await loginApi(email, password);

      // ✅ Check token exists
      if (!data?.accessToken) {
        throw new Error("Login failed");
      }

      // 🚨 Check user active
      if (!data.user.isActive) {
        showToast("User is inactive ❌", "error");
        setLoading(false);
        return;
      }

      // ✅ SAVE HERE (THIS IS YOUR QUESTION)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify({
        userId: data.user.userId,
        userName: data.user.userName
      }));

      showToast("Login successful 🎉", "success");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      showToast("Invalid username or password ❌", "error");

      setEmail("");
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
      {/* TITLE */}
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-[#49293e]">
        Login
      </h2>

      {/* USERNAME */}
      <FormInput
        type="text"
        placeholder="Username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* PASSWORD */}
      <FormInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* FORGOT PASSWORD */}
      <p
        onClick={() => navigate("/forgot-password")}
        className="text-sm text-right mt-2 mb-4 text-gray-600 cursor-pointer hover:underline"
      >
        Forgot Password?
      </p>

      {/* BUTTON */}
      <Button type="submit" size="lg" fullWidth disabled={loading} >
        {loading ? "Logging in..." : "Login"}
      </Button>

    </form>
  );
};

export default LoginForm;