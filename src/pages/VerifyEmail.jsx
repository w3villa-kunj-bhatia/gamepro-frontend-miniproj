import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const VerifyEmail = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // If user becomes verified, move them to dashboard
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleCheckStatus = async () => {
    await refreshUser(); // Re-fetches user from /auth/me
    if (!user?.isEmailVerified) {
      setMessage("Email still not verified. Please check your inbox.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold">Please Verify Your Email</h1>
      <p className="mt-4">
        A verification link was sent to <strong>{user?.email}</strong>.
      </p>
      {message && <p className="mt-2 text-orange-600">{message}</p>}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleCheckStatus}
          className="px-4 py-2 text-white bg-green-600 rounded"
        >
          I've Verified My Email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
