import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const ProtectedRoute = () => {
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  // Only redirect to login if BOTH tokens are completely absent.
  // If the access token is expired but a refresh token still exists,
  // the Axios interceptor in api.ts will transparently refresh it on
  // the next API call. Do NOT force logout here — that was causing the
  // "logout on Save" bug where a valid form submission got the user kicked out
  // because the frontend sessionExpiresAt timer had lapsed while the
  // backend refresh token was still perfectly valid.
  if (!accessToken && !refreshToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;