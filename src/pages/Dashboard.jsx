import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const planConfigs = {
  gold: {
    emoji: "👑",
    label: "Gold Member",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconBg: "bg-amber-500",
    shadow: "shadow-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-500",
    gradient: "from-amber-500/20 to-transparent",
  },
  silver: {
    emoji: "⚔️",
    label: "Silver Member",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    bar: "bg-slate-400",
    bgColor: "bg-slate-300/10",
    borderColor: "border-slate-300/20",
    iconBg: "bg-slate-400",
    shadow: "shadow-slate-400/20",
    textColor: "text-slate-500 dark:text-slate-300",
    gradient: "from-slate-400/20 to-transparent",
  },
  free: {
    emoji: "💪",
    label: "Free Member",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar: "bg-indigo-500",
    bgColor: "bg-indigo-600/10",
    borderColor: "border-indigo-600/20",
    iconBg: "bg-indigo-600",
    shadow: "shadow-indigo-600/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-600/20 to-transparent",
  },
};

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm Logout
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Are you sure you want to end your session? You will need to login
          again to access your squadron.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, onClose, isSaved, onToggleSave }) => {
  if (!profile) return null;

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsEndRef = useRef(null);

  const currentPlan = profile.plan || profile.user?.plan || "free";
  const theme = planConfigs[currentPlan] || planConfigs.free;

  useEffect(() => {
    if (profile._id) {
      fetchComments();
    }
  }, [profile._id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await api.get(`/comments/${profile._id}`);
      setComments(res.data.data);
    } catch (err) {
      console.error("Failed to load comms", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/comments/${profile._id}`, {
        text: commentText,
      });
      setComments([res.data.data, ...comments]);
      setCommentText("");
      toast.success("Transmission successful.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transmission failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-2xl animate-slide-up flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 text-gray-600 dark:text-white rounded-full transition-colors border border-transparent dark:border-white/10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="w-full md:w-1/3 relative p-6 md:p-8 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50 shrink-0">
          <div
            className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-50`}
          />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="relative mb-6">
              <img
                src={
                  profile.avatar ||
                  `https://ui-avatars.com/api/?name=${profile.username}&background=random`
                }
                alt={profile.username}
                className={`w-32 h-32 rounded-full border-4 ${theme.borderColor} shadow-2xl object-cover bg-white dark:bg-slate-800`}
              />
              <div
                className={`absolute bottom-0 right-0 w-10 h-10 ${theme.iconBg} rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-lg shadow-lg`}
              >
                {theme.emoji}
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center">
              {profile.username}
            </h2>
            <span
              className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${theme.bgColor} ${theme.textColor} border ${theme.borderColor}`}
            >
              {theme.label}
            </span>

            {profile.address && (
              <div className="flex items-center gap-2 mt-6 text-gray-600 dark:text-slate-400 text-sm font-medium bg-white dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                <span>📍</span> {profile.address}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave && onToggleSave(e);
              }}
              className={`mt-6 w-full max-w-[200px] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                isSaved
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 group"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30 hover:-translate-y-1"
              }`}
            >
              <span className={isSaved ? "group-hover:hidden" : ""}>
                {isSaved ? "✓ Saved" : "Save Profile"}
              </span>
              <span className={`hidden ${isSaved ? "group-hover:inline" : ""}`}>
                Unsave
              </span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-6 md:p-8 bg-white dark:bg-slate-900 relative md:overflow-y-auto md:max-h-[90vh] custom-scrollbar">
          <div className="space-y-8 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                <span className="text-xl">🎮</span>
                <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                  Identified Games ({profile.games?.length || 0})
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {profile.games?.length > 0 ? (
                  profile.games.map((g, i) => (
                    <div key={i} className="group relative">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md transition-all group-hover:border-indigo-500/50">
                        <img
                          src={g.coverUrl}
                          alt={g.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl p-1 pointer-events-none">
                        <span className="text-[10px] text-white text-center font-bold leading-tight">
                          {g.name}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500 dark:text-slate-600 text-sm italic py-4">
                    No games public.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                <span className="text-xl">👥</span>
                <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                  Top Agents
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                {profile.topCharacters?.length > 0 ? (
                  profile.topCharacters.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-slate-900"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300 leading-tight">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-500 uppercase">
                          Deployed
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-slate-600 text-sm italic py-4">
                    No agents deployed.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                <span className="text-xl">💬</span>
                <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                  Comms Channel
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
                <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Transmit encrypted message..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <svg
                      className="w-5 h-5 rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>

                <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  {loadingComments ? (
                    <div className="flex justify-center py-4">
                      <span className="text-xs animate-pulse text-gray-500">
                        Decrypting streams...
                      </span>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex gap-3 items-start animate-fade-in"
                      >
                        <img
                          src={
                            comment.authorProfile?.avatar ||
                            `https://ui-avatars.com/api/?name=User`
                          }
                          alt="User"
                          className="w-8 h-8 rounded-full bg-gray-200 object-cover border border-gray-200 dark:border-slate-700"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {comment.authorProfile?.username ||
                                "Unknown Operative"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-r-xl rounded-bl-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-gray-400 dark:text-slate-600 py-4 italic">
                      Channel silent. Be the first to transmit.
                    </p>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const searchQuery = searchParams.get("search") || "";

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReactions, setMyReactions] = useState({});
  const [mySavedIds, setMySavedIds] = useState(new Set());
  const [myStats, setMyStats] = useState({
    gamesCount: 0,
    savedCount: 0,
    planLimit: 0,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const LIMIT = 6;

  const currentPlan = user?.plan || "free";
  const theme = planConfigs[currentPlan] || planConfigs.free;

  const plansLimits = {
    free: { savedProfiles: 3 },
    silver: { savedProfiles: 5 },
    gold: { savedProfiles: 10 },
  };
  const limit = plansLimits[currentPlan]?.savedProfiles || 3;

  const updateParams = (newParams) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      return next;
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [savedRes, meRes] = await Promise.all([
          api.get("/saved-profiles"),
          api.get("/profile/me"),
        ]);

        const savedIds = new Set(
          savedRes.data.data.map((item) => item.profile._id),
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
          `/dashboard/profiles?page=${page}&limit=${LIMIT}${queryParam}`,
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
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/");
  };

  const handleReaction = async (profileId, type) => {
    try {
      const res = await api.post(`/reactions/${profileId}`, { type });
      const { likes, dislikes } = res.data.data;

      setMyReactions((prev) => ({
        ...prev,
        [profileId]: type,
      }));

      setProfiles((prev) =>
        prev.map((p) => {
          if (p._id === profileId) {
            return {
              ...p,
              likes: likes,
              dislikes: dislikes,
            };
          }
          return p;
        }),
      );
    } catch (err) {
      console.error(`Failed to ${type} profile:`, err);
    }
  };

  const handleToggleSave = async (profileId, e) => {
    e.stopPropagation();
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
        toast.success("Operative removed from squadron.");
      } else {
        await api.post(`/saved-profiles/${profileId}`);
        setMySavedIds((prev) => new Set(prev).add(profileId));
        setMyStats((prev) => ({ ...prev, savedCount: prev.savedCount + 1 }));
        toast.success("Operative added to your squadron.");
      }
    } catch (err) {
      console.error("Failed to toggle save profile:", err);
      const msg = err.response?.data?.message || "Action failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Welcome to GamePro, {user?.username || "Operative"}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Command Center & Player Database
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="hidden md:block bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
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
              onClick={() => updateParams({ page: Math.max(1, page - 1) })}
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
              onClick={() => updateParams({ page: page + 1 })}
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

              const cardPlan = profile.plan || "free";
              const cardTheme = planConfigs[cardPlan] || planConfigs.free;

              return (
                <div
                  key={profile._id}
                  onClick={() => setSelectedProfile(profile)}
                  className="p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 relative group cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <div className="relative mr-4">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.username}
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 dark:border-slate-700 group-hover:border-indigo-500 transition-colors"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xl border-2 border-transparent group-hover:border-indigo-500 transition-all">
                          {profile.username?.charAt(0).toUpperCase() || "P"}
                        </div>
                      )}

                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-slate-900 ${cardTheme.iconBg} text-white`}
                      >
                        {cardTheme.emoji}
                      </div>
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="font-bold text-lg leading-tight truncate text-gray-900 dark:text-white">
                        {profile.username || "Anonymous Player"}
                      </h4>
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider ${cardTheme.color}`}
                      >
                        {cardTheme.label}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 bg-gray-50 dark:bg-slate-950/50 p-2 rounded-lg">
                    🎮 Games Collected:{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {profile.games?.length || 0}
                    </span>
                  </p>

                  <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(profile._id, "like");
                        }}
                        className={`flex items-center justify-center px-3 py-1.5 rounded-lg transition-all text-xs font-bold gap-1 border ${
                          myReactions[profile._id] === "like"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                            : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                      >
                        👍 {profile.likes || 0}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(profile._id, "dislike");
                        }}
                        className={`flex items-center justify-center px-3 py-1.5 rounded-lg transition-all text-xs font-bold gap-1 border ${
                          myReactions[profile._id] === "dislike"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                            : "bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        👎 {profile.dislikes || 0}
                      </button>
                      <button className="flex items-center justify-center px-3 py-1.5 rounded-lg transition-all text-xs font-bold gap-1 border border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        💬 {profile.commentCount || 0}
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(profile._id, e)}
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
                    setSearchInput("");
                    updateParams({ search: "", page: 1 });
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

      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          isSaved={mySavedIds.has(selectedProfile._id)}
          onToggleSave={(e) => handleToggleSave(selectedProfile._id, e)}
        />
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Dashboard;
