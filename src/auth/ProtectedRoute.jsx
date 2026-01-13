import { Navigate, Outlet } from "react-router-dom"; // Added Outlet here
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but email is not verified, redirect to verification page
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Render child routes if authenticated and verified
  return <Outlet />; // This will now work correctly
};

export default ProtectedRoute;
