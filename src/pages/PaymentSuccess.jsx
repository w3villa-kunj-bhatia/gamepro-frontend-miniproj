import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // If you have a way to refresh user data in context, do it here
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setStatus("No session ID found.");
        return;
      }

      try {
        await api.post("/payment/verify", { session_id: sessionId });
        setStatus("Payment Successful! Upgrading your account...");

        // Wait 2 seconds then go to dashboard
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload(); // Reload to ensure auth context gets new plan data
        }, 2000);
      } catch (err) {
        console.error(err);
        setStatus("Payment verification failed. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold mb-2">Payment Complete</h1>
      <p className="text-gray-500 animate-pulse">{status}</p>
    </div>
  );
};

export default PaymentSuccess;
