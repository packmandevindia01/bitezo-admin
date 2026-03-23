import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "../components/layout/MainLayout";


import CompanyRegistrationPage from "../features/company/pages/CompanyRegistrationPage";
import UserCreationPage from "../features/user/pages/UserCreationPage"; // ✅ FIXED
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UserList from "../features/user/pages/UserList";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<LoginPage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<MainLayout />}>

          {/* Default */}
          <Route index element={<CompanyRegistrationPage />} />

          {/* USER */}
          <Route path="users" element={<UserList />} />
          <Route path="user/create" element={<UserCreationPage />} />
          

        </Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;