import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

const libraries = ["places"];

const planConfigs = {
  gold: {
    games: 10,
    savedProfiles: 10,
    emoji: "👑",
    label: "Gold Member",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconBg: "bg-amber-500",
    shadow: "shadow-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-500",
    gradient: "from-amber-500/20 to-transparent",
  },
  silver: {
    games: 5,
    savedProfiles: 5,
    emoji: "⚔️",
    label: "Silver Member",
    bgColor: "bg-slate-300/10",
    borderColor: "border-slate-300/20",
    iconBg: "bg-slate-400",
    shadow: "shadow-slate-400/20",
    textColor: "text-slate-500 dark:text-slate-300",
    gradient: "from-slate-400/20 to-transparent",
  },
  free: {
    games: 3,
    savedProfiles: 3,
    emoji: "💪",
    label: "Free Member",
    bgColor: "bg-indigo-600/10",
    borderColor: "border-indigo-600/20",
    iconBg: "bg-indigo-600",
    shadow: "shadow-indigo-600/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-600/20 to-transparent",
  },
};

const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

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

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [myComments, setMyComments] = useState([]);
  const [myCommentText, setMyCommentText] = useState("");
  const [loadingMyComments, setLoadingMyComments] = useState(false);
  const myCommentsEndRef = useRef(null);

  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, savedRes] = await Promise.all([
          api.get("/profile/me"),
          api.get("/saved-profiles"),
        ]);
        setProfile(profileRes.data.data);
        setSavedProfiles(savedRes.data.data || []);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profile?._id) {
      fetchMyComments();
    }
  }, [profile?._id]);

  useEffect(() => {
    if (!authUser?.planExpiresAt || authUser.plan === "free") {
      setTimeLeft("");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const expirationDate = new Date(authUser.planExpiresAt);
      const distance = expirationDate - now;

      if (distance < 0) {
        setTimeLeft("Plan Expired");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [authUser]);

  const fetchMyComments = async () => {
    try {
      setLoadingMyComments(true);
      const res = await api.get(`/comments/${profile._id}`);
      setMyComments(res.data.data);
    } catch (err) {
      console.error("Failed to load my comments", err);
    } finally {
      setLoadingMyComments(false);
    }
  };

  const handlePostMyComment = async (e) => {
    e.preventDefault();
    if (!myCommentText.trim()) return;

    try {
      const res = await api.post(`/comments/${profile._id}`, {
        text: myCommentText,
      });
      setMyComments([res.data.data, ...myComments]);
      setMyCommentText("");
      toast.success("Transmission successful.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transmission failed.");
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate("/");
  };

  const downloadProfilePDF = async () => {
    if (!profile) return;
    const element = document.getElementById("profile-identity");
    if (!element) return;

    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#020617",
        logging: false,
        windowWidth: 1600,
        ignoreElements: (el) => el.classList.contains("download-btn-wrapper"),
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.getElementById("profile-identity");
          if (clonedContainer) {
            clonedContainer.style.width = "1200px";
            clonedContainer.style.maxWidth = "none";
            clonedContainer.style.margin = "0";
            clonedContainer.style.padding = "20px";
            clonedContainer.style.display = "grid";
            clonedContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
            clonedContainer.style.gap = "1rem";

            const children = Array.from(clonedContainer.children);
            if (children[0]) {
              children[0].style.gridColumn = "span 1";
              children[0].style.gridRow = "span 3";
            }
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const margin = 10;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const ratio = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight,
      );
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`${profile.username || "Operative"}_Profile.pdf`);
      toast.success("Profile capture successful.");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleSave = async (profileId, e) => {
    e?.stopPropagation();
    const isSaved = savedProfiles.some(
      (item) => item.profile._id === profileId,
    );

    try {
      if (isSaved) {
        await api.delete(`/saved-profiles/${profileId}`);
        setSavedProfiles((prev) =>
          prev.filter((item) => item.profile._id !== profileId),
        );
        toast.success("Operative removed from squadron.");
      } else {
        await api.post(`/saved-profiles/${profileId}`);
        setSavedProfiles((prev) => [
          ...prev,
          { _id: Date.now(), profile: selectedProfile },
        ]);
        toast.success("Operative added to squadron.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Action failed.");
    }
  };

  if (loading) return <Loader />;

  const currentPlan = authUser?.plan || "free";
  const limits = planConfigs[currentPlan] || planConfigs.free;
  const theme = planConfigs[currentPlan] || planConfigs.free;

  const hasCoordinates =
    profile?.coordinates &&
    (profile.coordinates.lat !== 0 || profile.coordinates.lng !== 0);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-4 md:p-8 pt-24 pb-36 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm pr-2">
            Operative Profile
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Identity & Archives
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="hidden md:block bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
        >
          Logout
        </button>
      </div>

      <div
        id="profile-identity"
        className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min"
      >
        <div className="md:col-span-1 lg:col-span-1 lg:row-span-3 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-gray-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col items-center shadow-xl relative overflow-hidden group ">
          <div
            className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${theme.bgColor.replace(
              "/10",
              "/5",
            )} to-transparent opacity-50`}
          />

          <div className="text-center w-full relative z-10 flex-1 flex flex-col items-center">
            <div className="relative inline-block mb-10 mt-4">
              <img
                src={
                  profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    profile?.username || "User"
                  }&background=random`
                }
                className={`w-36 h-36 rounded-full mx-auto border-4 ${theme.borderColor} shadow-2xl object-cover bg-gray-100 dark:bg-slate-800`}
                alt="Avatar"
              />
              <div
                className={`absolute bottom-2 right-2 w-10 h-10 ${theme.iconBg} rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-lg shadow-lg`}
              >
                {theme.emoji}
              </div>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tighter truncate w-full text-gray-900 dark:text-white">
              {profile?.username || "Operative"}
            </h2>
            <div className="flex flex-col items-center mt-2 mb-12">
              <p className="text-indigo-600 dark:text-indigo-400 text-[12px] font-bold uppercase tracking-[0.2em]">
                System Level: {currentPlan}
              </p>
              {timeLeft && (
                <span className="mt-2 text-[12px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/50">
                  ⏳ Expires: {timeLeft}
                </span>
              )}
            </div>

            <div className="mt-2 w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-12">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📍</span>
                <p className="text-gray-600 dark:text-slate-300 text-md font-medium truncate">
                  {profile?.address || "Location Hidden"}
                </p>
              </div>

              <div className="mt-5 aspect-video w-full bg-gray-200 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {isMapLoaded && hasCoordinates ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={profile.coordinates}
                    zoom={13}
                    options={{
                      disableDefaultUI: true,
                    }}
                  >
                    <Marker position={profile.coordinates} />
                  </GoogleMap>
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/about/images/mymaps/mymaps-desktop-16x9.png')] bg-cover bg-center grayscale" />
                    <span className="relative z-10 text-[8px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest bg-white/80 dark:bg-slate-950/80 px-2 py-1 rounded">
                      {isMapLoaded
                        ? "Coordinates Not Found"
                        : "Map Synchronization Pending"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-auto w-full flex flex-col gap-2 download-btn-wrapper">
              <Link
                to="/create-profile"
                className="w-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600 border border-gray-200 dark:border-slate-700 hover:border-indigo-500 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg text-center text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-white"
              >
                Edit Identity
              </Link>
              <button
                onClick={downloadProfilePDF}
                disabled={isDownloading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-white"
              >
                {isDownloading ? "Generating..." : "Capture Dashboard (PDF)"}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:col-span-1 lg:col-span-1 min-h-[160px] ${theme.bgColor} ${theme.borderColor} border rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}
        >
          <div
            className={`w-14 h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center mb-3 shadow-lg ${theme.shadow} group-hover:rotate-12 transition-transform duration-500`}
          >
            <span className="text-2xl">{theme.emoji}</span>
          </div>
          <h3
            className={`text-lg font-black uppercase tracking-widest ${theme.textColor}`}
          >
            {theme.label}
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Current Tier
          </p>
        </div>

        <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-gray-200 dark:border-slate-800/80 rounded-3xl p-6 overflow-hidden relative">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">
              {profile?.username}'s Favourite Games (
              {profile?.games?.length || 0} / {limits.games})
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {profile?.games?.map((game, i) => {
              const isLocked = i >= limits.games;
              return (
                <div
                  key={i}
                  className="flex-shrink-0 group relative w-24 snap-start"
                >
                  <div
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border ${
                      isLocked
                        ? "border-red-900/30"
                        : "border-gray-200 dark:border-slate-700 group-hover:border-indigo-500"
                    } transition-all`}
                  >
                    <img
                      src={game.coverUrl}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isLocked
                          ? "grayscale blur-sm opacity-30"
                          : "group-hover:scale-110"
                      }`}
                      alt={game.name}
                    />
                    {!isLocked && (
                      <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-tighter leading-tight text-white">
                          {game.name}
                        </span>
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-2xl drop-shadow-lg">🔒</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 relative overflow-hidden flex items-center min-h-[70px]">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${theme.iconBg} opacity-80`}
          />
          <p className="text-sm font-mono text-gray-600 dark:text-slate-400 pl-4 leading-relaxed">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              SYSTEM_LOG:
            </span>{" "}
            Synchronization complete. Status:{" "}
            <span className={`${theme.textColor} font-bold`}>
              {currentPlan.toUpperCase()}
            </span>
          </p>
        </div>

        <div className="md:col-span-1 lg:col-span-1 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col max-h-[320px]">
          <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest block mb-6 shrink-0">
            {profile?.username}'s Network ({savedProfiles.length} /{" "}
            {limits.savedProfiles})
          </span>

          <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2">
            {savedProfiles.map((item, i) => {
              const isLocked = i >= limits.savedProfiles;

              return (
                <div
                  key={item._id}
                  onClick={() => !isLocked && setSelectedProfile(item.profile)}
                  className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    isLocked
                      ? "border-red-900/30 cursor-not-allowed"
                      : "border-gray-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer"
                  }`}
                >
                  <img
                    src={
                      item.profile?.avatar ||
                      `https://ui-avatars.com/api/?name=${item.profile?.username}`
                    }
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isLocked
                        ? "grayscale blur-sm opacity-30"
                        : "group-hover:scale-95"
                    }`}
                    alt={item.profile?.username}
                  />

                  {!isLocked && (
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                      <p className="text-[10px] font-bold text-white leading-tight truncate w-full">
                        {item.profile?.username || "Operative"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-1 lg:col-span-2 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-start">
          <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest block mb-6">
            {profile?.username}'s Squadron
          </span>

          <div className="flex flex-wrap gap-3">
            {profile?.topCharacters?.length > 0 ? (
              profile.topCharacters.map((char, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 pr-4 pl-1 py-1 rounded-full border border-gray-200 dark:border-slate-700/50 hover:border-indigo-500/50 group transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={char.imageUrl}
                      className="w-10 h-10 rounded-full border border-indigo-500/30 object-cover group-hover:scale-110 group-hover:rotate-12 transition-transform"
                      alt={char.name}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-tight text-gray-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                      {char.name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-800/50 rounded-2xl flex items-center justify-center">
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest italic">
                  No Squad Deployed
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-start">
          <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest block mb-6">
            Incoming Transmissions (Comments)
          </span>

          <div className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
            <form onSubmit={handlePostMyComment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={myCommentText}
                onChange={(e) => setMyCommentText(e.target.value)}
                placeholder="Transmit encrypted message..."
                className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!myCommentText.trim()}
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

            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {loadingMyComments ? (
                <div className="flex justify-center py-4">
                  <span className="text-xs animate-pulse text-gray-500">
                    Decrypting streams...
                  </span>
                </div>
              ) : myComments.length > 0 ? (
                myComments.map((comment) => (
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
                  Channel silent. No incoming transmissions.
                </p>
              )}
              <div ref={myCommentsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          isSaved={savedProfiles.some(
            (p) => p.profile._id === selectedProfile._id,
          )}
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

export default Profile;
