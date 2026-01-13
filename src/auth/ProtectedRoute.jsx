import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
// import AdminDashboard from "../pages/admin/AdminDashboard";

// 1. Accept 'children' and 'adminOnly' from props
const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can replace this with your Loader component if you like
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // 2. Not Logged In -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logged In but Email Not Verified -> Redirect to Verify
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 4. Admin Route Guard -> If route is adminOnly but user is NOT admin
  if (adminOnly && user.role !== "admin") {
    // Redirect standard users away from admin pages
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Render the actual component (Dashboard, Profile, etc.)
  return children;
};

export default ProtectedRoute;
