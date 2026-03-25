import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import MainLayout from "../components/layout/MainLayout";


import CompanyRegistrationPage from "../features/customer/pages/CustomerRegistrationPage";
import UserCreationPage from "../features/user/pages/UserCreationPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import UserList from "../features/user/pages/UserList";
/* import ProtectedRoute from "./ProtectedRoute"; */
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CustomerList from "../features/customer/pages/CustomerListPage";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<LoginPage />} />

        {/* <Route element={<ProtectedRoute />}> */}
        <Route path="/dashboard" element={<MainLayout />}>

          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/create" element={<CompanyRegistrationPage />} />
          <Route
            path="/dashboard/customers/edit/:id"
            element={<CompanyRegistrationPage />}
          />

          <Route path="users" element={<UserList />} />
          <Route path="user/create" element={<UserCreationPage />} />

        </Route>
        {/* </Route> */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;