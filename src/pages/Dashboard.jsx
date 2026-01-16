import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mySavedIds, setMySavedIds] = useState(new Set());
  const [myStats, setMyStats] = useState({
    gamesCount: 0,
    savedCount: 0,
    planLimit: 0,
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const LIMIT = 6;

  const planConfigs = {
    gold: {
      emoji: "👑",
      label: "Gold Member",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      bar: "bg-amber-500",
    },
    silver: {
      emoji: "⚔️",
      label: "Silver Member",
      color: "text-slate-400",
      bg: "bg-slate-400/10",
      border: "border-slate-400/20",
      bar: "bg-slate-400",
    },
    free: {
      emoji: "💪",
      label: "Free Member",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      bar: "bg-indigo-500",
    },
  };

  const currentPlan = user?.plan || "free";
  const theme = planConfigs[currentPlan] || planConfigs.free;

  const plansLimits = {
    free: { savedProfiles: 3 },
    silver: { savedProfiles: 5 },
    gold: { savedProfiles: 10 },
  };
  const limit = plansLimits[currentPlan]?.savedProfiles || 3;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [savedRes, meRes] = await Promise.all([
          api.get("/saved-profiles"),
          api.get("/profile/me"),
        ]);

        const savedIds = new Set(
          savedRes.data.data.map((item) => item.profile._id)
        );
        setMySavedIds(savedIds);

        setMyStats({
          savedCount: savedRes.data.data.length,
          gamesCount: meRes.data.data.games.length,
        });
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const queryParam = searchQuery
          ? `&search=${encodeURIComponent(searchQuery)}`
          : "";

        const res = await api.get(
          `/dashboard/profiles?page=${page}&limit=${LIMIT}${queryParam}`
        );

        if (res.data?.data) {
          const profileData = res.data.data.data || res.data.data;
          setProfiles(Array.isArray(profileData) ? profileData : []);
          setTotalPages(res.data.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard profiles:", err);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [page, searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleReaction = async (profileId, type) => {
    try {
      await api.post(`/reactions/${profileId}`, { type });
      setProfiles((prev) =>
        prev.map((p) => {
          if (p._id === profileId) {
            return {
              ...p,
              likes: type === "like" ? (p.likes || 0) + 1 : p.likes,
              dislikes: type === "dislike" ? (p.dislikes || 0) + 1 : p.dislikes,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error(`Failed to ${type} profile:`, err);
    }
  };

  const handleToggleSave = async (profileId) => {
    const isSaved = mySavedIds.has(profileId);
    try {
      if (isSaved) {
        await api.delete(`/saved-profiles/${profileId}`);
        setMySavedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        setMyStats((prev) => ({ ...prev, savedCount: prev.savedCount - 1 }));
      } else {
        await api.post(`/saved-profiles/${profileId}`);
        setMySavedIds((prev) => new Set(prev).add(profileId));
        setMyStats((prev) => ({ ...prev, savedCount: prev.savedCount + 1 }));
        alert("Operative added to your squadron.");
      }
    } catch (err) {
      console.error("Failed to toggle save profile:", err);
      const msg = err.response?.data?.message || "Action failed.";
      alert(msg);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Welcome, {user?.username || "Operative"}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Command Center & Player Database
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div
          className={`p-6 bg-white dark:bg-slate-900 shadow-lg rounded-2xl border ${theme.border} flex flex-col justify-between group transition-all`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wider">
              Clearance Level
            </h3>
            <span className="text-2xl">{theme.emoji}</span>
          </div>
          <p
            className={`text-3xl font-black ${theme.color} capitalize group-hover:scale-105 transition-transform origin-left`}
          >
            {user?.plan || "free"}
          </p>
          <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className={`${theme.bar} h-full w-full rounded-full`}></div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 shadow-lg rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wider">
              Squadron Size
            </h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform origin-left">
              {myStats.savedCount}
            </p>
            <span className="text-sm font-bold text-gray-400">/ {limit}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 font-mono">
            OPERATIVES RECRUITED
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 shadow-lg rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between group hover:border-purple-500/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wider">
              Arsenal
            </h3>
            <span className="text-2xl">🎮</span>
          </div>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform origin-left">
            {myStats.gamesCount}
          </p>
          <p className="text-[10px] text-gray-400 mt-4 font-mono">
            GAMES IN LIBRARY
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          Explore Operatives
          <span className="bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
            {profiles.length} Found
          </span>
        </h2>

        {!loading && (
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                page === 1
                  ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 shadow-sm"
              }`}
            >
              Prev
            </button>
            <span className="px-2 text-gray-600 dark:text-gray-400 font-mono text-xs font-bold">
              {page}/{totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                page >= totalPages
                  ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              }`}
            >
              Next
            </button>
          </div>
        )}

        <div className="flex w-full lg:w-auto gap-2">
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Username..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length > 0 ? (
            profiles.map((profile) => {
              const isSaved = mySavedIds.has(profile._id);
              if (profile._id === user?._id) return null;

              return (
                <div
                  key={profile._id}
                  className="p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 relative group"
                >
                  <div className="flex items-center mb-4">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-gray-100 dark:border-slate-700 group-hover:border-indigo-500 transition-colors"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold mr-4 text-xl border-2 border-transparent group-hover:border-indigo-500 transition-all">
                        {profile.username?.charAt(0).toUpperCase() || "P"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-lg leading-tight truncate text-gray-900 dark:text-white">
                        {profile.username || "Anonymous Player"}
                      </h4>
                      <span className="text-xs text-gray-400 font-mono">
                        ID: {profile._id.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 bg-gray-50 dark:bg-slate-950/50 p-2 rounded-lg">
                    🎮 Games Collected:{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {profile.games?.length || 0}
                    </span>
                  </p>

                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReaction(profile._id, "like")}
                        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition text-sm font-bold gap-1"
                      >
                        👍 {profile.likes || 0}
                      </button>
                      <button
                        onClick={() => handleReaction(profile._id, "dislike")}
                        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition text-sm font-bold gap-1"
                      >
                        👎 {profile.dislikes || 0}
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleSave(profile._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md ${
                        isSaved
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 hover:content-['Unsave']"
                          : "text-white bg-gray-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600"
                      }`}
                    >
                      {isSaved ? "✓ Saved" : "Save Profile"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
              <p className="text-gray-500 text-lg">
                No operatives found matching "{searchQuery}"
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchInput("");
                  }}
                  className="mt-4 text-blue-600 hover:underline font-bold"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-24 w-full"></div>
    </div>
  );
};

export default Dashboard;
