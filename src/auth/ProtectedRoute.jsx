import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Still checking auth (initial load / refresh)
  if (loading) {
    return <Loader />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but email not verified
  if (!user?.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Admin-only route protection
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;
