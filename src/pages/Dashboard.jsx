import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6; 

  useEffect(() => {
    fetchDashboardData();
  }, [page]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/dashboard/profiles?page=${page}&limit=${LIMIT}`
      );

      if (res.data?.data) {
        const profileData = res.data.data.data || res.data.data;
        setProfiles(profileData);

        if (res.data.data.totalPages) {
          setTotalPages(res.data.data.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleReaction = async (profileId, type) => {
    try {
      await api.post(`/reactions/${profileId}`, { type });

      fetchDashboardData();
    } catch (err) {
      console.error(`Failed to ${type} profile:`, err);
      alert("Failed to update reaction.");
    }
  };

  const handleSaveProfile = async (profileId) => {
    try {
      await api.post(`/saved-profiles/${profileId}`);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      if (err.response && err.response.status === 400) {
        alert("You have already saved this profile.");
      } else {
        alert("Failed to save profile.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.email}!
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition"
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
        <div className="flex justify-center py-10">
          <p className="text-gray-500">Loading player profiles...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <div
                  key={profile._id}
                  className="p-5 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition relative"
                >
                  <div className="flex items-center mb-3">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="h-10 w-10 rounded-full object-cover mr-3 border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                        {profile.username?.charAt(0).toUpperCase() || "P"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg leading-tight">
                        {profile.username || "Anonymous Player"}
                      </h4>
                      <span className="text-xs text-gray-400">
                        ID: {profile._id.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    Games Collected: {profile.games?.length || 0}
                  </p>

                  <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReaction(profile._id, "like")}
                        className="flex items-center text-gray-600 hover:text-green-600 transition text-sm font-medium"
                      >
                        👍 {profile.likes || 0}
                      </button>
                      <button
                        onClick={() => handleReaction(profile._id, "dislike")}
                        className="flex items-center text-gray-600 hover:text-red-600 transition text-sm font-medium"
                      >
                        👎 {profile.dislikes || 0}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveProfile(profile._id)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-semibold transition"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-10">
                No profiles found.
              </p>
            )}
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? "bg-gray-200 text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 font-medium">
              Page {page}
            </span>
            <button
              disabled={profiles.length < LIMIT}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded ${
                profiles.length < LIMIT
                  ? "bg-gray-200 text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
