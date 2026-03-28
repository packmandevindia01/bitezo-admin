import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { clearCredentials } from "../store/authSlice";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const ProtectedRoute = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // No token at all
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  // Token expired
  if (isTokenExpired(accessToken)) {
    dispatch(clearCredentials()); // ✅ clears Redux + localStorage
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;