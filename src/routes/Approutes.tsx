import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "../components/layout/MainLayout";

import CompanyRegistrationPage from "../features/customer/pages/CustomerRegistrationPage";
import UserCreationPage from "../features/user/pages/UserCreationPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UserList from "../features/user/pages/UserList";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CustomerList from "../features/customer/pages/CustomerListPage";
import CustomerReportPage from "../features/reports/pages/CustomerReportPage";
import UserReportPage from "../features/reports/pages/UserReportPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<LoginPage />} />

        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/create" element={<CompanyRegistrationPage />} />
          <Route path="customers/edit/:id" element={<CompanyRegistrationPage />} />  {/* ✅ relative */}

          <Route path="users" element={<UserList />} />
          <Route path="user/create" element={<UserCreationPage />} />

          <Route path="customers-reports" element={<CustomerReportPage />} />  {/* ✅ relative */}
          <Route path="users-reports" element={<UserReportPage />} />           {/* ✅ relative, fixed typo */}
        </Route>

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;