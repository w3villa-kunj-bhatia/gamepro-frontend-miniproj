import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard"); // Adjust route based on your backend
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {user?.username}!</h1>
        <button onClick={logout} className="text-red-500 underline">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="font-bold">Subscription Plan</h3>
          <p>{user?.plan || "Free"}</p>
        </div>
        {/* Render more stats here based on your backend response */}
      </div>
    </div>
  );
};

export default Dashboard;
