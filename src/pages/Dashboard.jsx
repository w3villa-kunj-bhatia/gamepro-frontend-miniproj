import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Corrected endpoint to match backend route
        const res = await api.get("/dashboard/profiles");

        // 2. Corrected data mapping:
        // res.data (Axios) -> .data (Backend Wrapper) -> .data (Service Pagination Object)
        if (res.data?.data?.data) {
          setProfiles(res.data.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        {/* 3. Changed user.username to user.email as per User model */}
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.email}!
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white shadow-sm rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">
            Subscription Plan
          </h3>
          <p className="text-2xl font-bold text-blue-600 capitalize">
            {user?.plan || "free"}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Explore Player Profiles
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading player profiles...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div
                key={profile._id}
                className="p-5 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    {profile.username?.charAt(0) || "P"}
                  </div>
                  <h4 className="font-bold text-lg">
                    {profile.username || "Anonymous Player"}
                  </h4>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Games Collected: {profile.games?.length || 0}
                </p>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-green-600 text-sm font-medium">
                    👍 {profile.likes || 0} Likes
                  </span>
                  <span className="text-red-600 text-sm font-medium">
                    👎 {profile.dislikes || 0} Dislikes
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">
              No other player profiles found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
