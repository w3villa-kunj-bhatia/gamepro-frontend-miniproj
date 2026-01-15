import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../api/axios";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useAuth(); 
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user && user.role !== "admin") {
        try {
          await api.get("/profile/me");
          setHasProfile(true);
        } catch (err) {
          setHasProfile(err.response?.status !== 404);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    if (!authLoading) {
      checkProfileStatus();
    }
  }, [user, authLoading]);

  if (authLoading || profileLoading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    user.role !== "admin" &&
    hasProfile === false &&
    location.pathname !== "/create-profile"
  ) {
    return <Navigate to="/create-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
