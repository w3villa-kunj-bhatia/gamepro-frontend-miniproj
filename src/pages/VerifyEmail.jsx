import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const VerifyEmail = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("loading");
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");

        await refreshUser();

        setTimeout(() => navigate("/dashboard"), 2000);
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. Link may be expired."
        );
      }
    };

    performVerification();
  }, [token, navigate, refreshUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {status === "success" ? (
        <h1 className="text-2xl font-bold text-green-600">
          Verification Successful!
        </h1>
      ) : status === "error" ? (
        <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
      ) : (
        <h1 className="text-2xl font-bold">Please Verify Your Email</h1>
      )}

      <p className="mt-4 text-gray-600">
        {message ||
          `A verification link was sent to ${user?.email || "your email"}.`}
      </p>

      {status === "loading" && !token && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-gray-500 italic">
            Click the link in your console log to proceed.
          </p>
          <button
            onClick={refreshUser}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            I've Clicked the Link
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
