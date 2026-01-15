import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import SavedProfiles from "../pages/SavedProfiles";
import Plans from "../pages/Plans";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";

import LandingPage from "../pages/LandingPage";
import CreateProfile from "../pages/CreateProfile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route
        path="/create-profile"
        element={
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
<Route
        path="/profile"
        element={
          <ProtectedRoute key="profile">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedProfiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Plans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly={true}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
