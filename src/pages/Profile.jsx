import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    emoji: "👑",
    label: "Gold Member",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconBg: "bg-amber-500",
    shadow: "shadow-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-500",
  },
  silver: {
    emoji: "⚔️",
    label: "Silver Member",
    bgColor: "bg-slate-300/10",
    borderColor: "border-slate-300/20",
    iconBg: "bg-slate-400",
    shadow: "shadow-slate-400/20",
    textColor: "text-slate-500 dark:text-slate-300",
  },
  free: {
    emoji: "💪",
    label: "Free Member",
    bgColor: "bg-indigo-600/10",
    borderColor: "border-indigo-600/20",
    iconBg: "bg-indigo-600",
    shadow: "shadow-indigo-600/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
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
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const ProfileModal = ({ profile, onClose }) => {
  if (!profile) return null;

  const currentPlan = profile.plan || profile.user?.plan || "free";
  const theme = planConfigs[currentPlan] || planConfigs.free;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${theme.bgColor.replace("/10", "/20")} to-transparent`}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6"
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

        <div className="relative z-10 p-10 flex flex-col items-center">
          <div className="relative mb-6">
            <img
              src={
                profile.avatar ||
                `https://ui-avatars.com/api/?name=${profile.username}&background=random`
              }
              alt={profile.username}
              className={`w-32 h-32 rounded-full border-4 ${theme.borderColor} shadow-2xl object-cover bg-slate-800`}
            />
            <div
              className={`absolute bottom-0 right-0 w-10 h-10 ${theme.iconBg} rounded-full border-4 border-slate-900 flex items-center justify-center text-lg shadow-lg`}
            >
              {theme.emoji}
            </div>
          </div>

          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {profile.username}
          </h2>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${theme.bgColor} ${theme.textColor} border ${theme.borderColor}`}
          >
            {theme.label}
          </span>

          {profile.address && (
            <div className="flex items-center gap-2 mt-5 text-slate-400 text-sm font-medium">
              <span>📍</span> {profile.address}
            </div>
          )}

          <div className="w-full mt-10 space-y-8">
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                Identified Games ({profile.games?.length || 0})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {profile.games?.length > 0 ? (
                  profile.games.map((g, i) => (
                    <div key={i} className="flex-shrink-0 w-24 group relative">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 shadow-md">
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
                  <p className="text-slate-600 text-sm italic w-full text-center py-4">
                    No games public.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                Top Agents
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.topCharacters?.length > 0 ? (
                  profile.topCharacters.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover bg-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-300">
                        {c.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-sm italic w-full text-center py-4">
                    No agents deployed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const [selectedProfile, setSelectedProfile] = useState(null);

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

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [authUser]);

  const downloadProfilePDF = async () => {
    if (!profile) return;
    const element = document.getElementById("profile-identity");
    if (!element) return;

    try {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#020617",
        logging: false,
        ignoreElements: (el) => el.classList.contains("download-btn-wrapper"),
        onclone: (clonedDoc) => {
          const usernameEl = clonedDoc.querySelector("#profile-identity h2");
          if (usernameEl) {
            usernameEl.classList.remove("truncate");
            usernameEl.style.whiteSpace = "normal";
            usernameEl.style.height = "auto";
          }
          const profileCard = clonedDoc.querySelector(
            "#profile-identity > div:first-child",
          );
          if (profileCard) {
            profileCard.style.backgroundColor = "#0f172a";
            profileCard.style.backdropFilter = "none";
          }
          const badgeEl = clonedDoc.querySelector(".absolute.bottom-2.right-2");
          if (badgeEl) {
            badgeEl.style.zIndex = "50";
            badgeEl.style.opacity = "1";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.username || "Operative"}_Identity.pdf`);
      toast.success("Identity profile downloaded successfully.");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Check console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <Loader />;

  const currentPlan = authUser?.plan || "free";
  const limits = planConfigs[currentPlan]
    ? planConfigs[currentPlan]
    : planConfigs.free;
  const theme = planConfigs[currentPlan] || planConfigs.free;

  const hasCoordinates =
    profile?.coordinates &&
    (profile.coordinates.lat !== 0 || profile.coordinates.lng !== 0);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-4 md:p-8 pt-24 pb-36 transition-colors duration-500">
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
                      styles: mapStyles,
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
                {isDownloading ? "Generating..." : "Download Identity (PDF)"}
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
            .{" "}
            {profile?.games?.length > 0
              ? "Data nodes active."
              : "Awaiting input."}
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
                  className={`relative group aspect-square rounded-2xl overflow-visible border-2 transition-all shrink-0 ${
                    isLocked
                      ? "border-red-900/30 overflow-hidden cursor-not-allowed"
                      : "border-gray-200 dark:border-slate-700 hover:border-indigo-500 cursor-pointer"
                  }`}
                >
                  <img
                    src={
                      item.profile?.avatar ||
                      `https://ui-avatars.com/api/?name=${item.profile?.username}`
                    }
                    className={`w-full h-full object-cover rounded-xl transition-transform duration-500 ${
                      isLocked
                        ? "grayscale blur-sm opacity-30"
                        : "group-hover:scale-95"
                    }`}
                    alt={item.profile?.username}
                  />

                  {!isLocked && (
                    <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                      <p className="text-[10px] font-bold text-white text-center">
                        {item.profile?.username || "Operative"}
                      </p>
                      <p className="text-[8px] text-gray-400 text-center uppercase tracking-wider mt-0.5">
                        Click to View
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900/90"></div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-2xl drop-shadow-lg">🔒</span>
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
                    <span className="text-[8px] font-medium text-gray-400 dark:text-slate-500 uppercase group-hover:text-indigo-500 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                      Active Unit
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
      </div>

      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

export default Profile;
