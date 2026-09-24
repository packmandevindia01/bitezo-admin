import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { clearCredentials } from "../store/authSlice";

const ProtectedRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken, sessionExpiresAt } = useSelector(
    (state: RootState) => state.auth
  );

  // No credentials at all
  if (!accessToken && !refreshToken) {
    return <Navigate to="/" replace />;
  }

  // Session expired
  if (sessionExpiresAt && new Date(sessionExpiresAt) <= new Date()) {
    dispatch(clearCredentials()); // ✅ clears Redux + localStorage
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;