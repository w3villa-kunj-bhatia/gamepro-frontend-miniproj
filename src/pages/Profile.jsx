import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local mirror of src/config/plans.js from backend
  const plansConfig = {
    free: { games: 3, savedProfiles: 3 },
    silver: { games: 5, savedProfiles: 5 },
    gold: { games: 10, savedProfiles: 10 },
  };

  useEffect(() => {
    api
      .get("/profile/me")
      .then((res) => setProfile(res.data.data))
      .catch((err) => console.error("Profile fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const currentPlan = authUser?.plan || "free";
  const limits = plansConfig[currentPlan];

  const planConfigs = {
    gold: {
      emoji: "👑",
      label: "Gold Member",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      iconBg: "bg-amber-500",
      shadow: "shadow-amber-500/40",
    },
    silver: {
      emoji: "⚔️",
      label: "Silver Member",
      bgColor: "bg-slate-300/10",
      borderColor: "border-slate-300/30",
      iconBg: "bg-slate-400",
      shadow: "shadow-slate-400/40",
    },
    free: {
      emoji: "💪",
      label: "Free Member",
      bgColor: "bg-indigo-600/10",
      borderColor: "border-indigo-600/30",
      iconBg: "bg-indigo-600",
      shadow: "shadow-indigo-600/40",
    },
  };

  const theme = planConfigs[currentPlan] || planConfigs.free;

  return (
    <div className="h-screen w-full bg-slate-950 text-white p-6 pt-20 overflow-hidden flex flex-col transition-colors duration-500">
      <div className="max-w-7xl mx-auto w-full h-full grid grid-cols-1 md:grid-cols-[280px_1fr_280px] md:grid-rows-[160px_1fr_180px] gap-4">
        {/* Profile Identity Column */}
        <div className="md:row-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between shadow-xl">
          <div className="text-center w-full">
            <div className="relative inline-block">
              <img
                src={
                  profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    profile?.username || "User"
                  }&background=random`
                }
                className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-600 mb-4 shadow-2xl shadow-indigo-600/20 object-cover"
                alt="Avatar"
              />
              <div
                className={`absolute bottom-4 right-0 w-8 h-8 ${theme.iconBg} rounded-full border-2 border-slate-900 flex items-center justify-center text-xs shadow-lg`}
              >
                {theme.emoji}
              </div>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter truncate">
              {profile?.username || "Operative"}
            </h2>
            <p className="text-slate-500 text-xs mt-1 truncate">
              {profile?.address || "Location Hidden"}
            </p>
          </div>
          <Link
            to="/create-profile"
            className="w-full bg-slate-800 py-3 rounded-xl text-center text-xs font-bold uppercase hover:bg-slate-700 hover:text-indigo-400 transition-all border border-slate-700"
          >
            Edit Profile
          </Link>
        </div>

        {/* Top Games with Plan-Based Locking */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden relative">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">
            Top Games ({profile?.games?.length || 0} / {limits.games})
          </span>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {profile?.games?.map((game, i) => {
              const isLocked = i >= limits.games;
              return (
                <div key={i} className="flex-shrink-0 group relative">
                  <img
                    src={game.coverUrl}
                    className={`w-20 h-28 rounded-lg object-cover border border-slate-800 transition-all ${
                      isLocked
                        ? "grayscale blur-[2px] opacity-40"
                        : "group-hover:border-indigo-500"
                    }`}
                    alt={game.name}
                  />
                  {isLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl filter drop-shadow-md">🔒</span>
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 w-full bg-black/80 p-1 text-[8px] font-bold text-center rounded-b-lg opacity-0 group-hover:opacity-100 transition-all">
                      {game.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Membership Badge */}
        <div
          className={`${theme.bgColor} ${theme.borderColor} border rounded-3xl p-4 flex flex-col items-center justify-center transition-all duration-500 group`}
        >
          <div
            className={`w-12 h-12 ${theme.iconBg} rounded-2xl flex items-center justify-center mb-2 shadow-lg ${theme.shadow} group-hover:scale-110 transition-transform`}
          >
            <span className="text-xl">{theme.emoji}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">
            {theme.label}
          </span>
        </div>

        {/* Saved Profiles with Logic-Based Placeholders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
            Saved Profiles ({limits.savedProfiles} Slots)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-20 rounded-xl border border-dashed flex items-center justify-center transition-colors ${
                  i >= limits.savedProfiles
                    ? "bg-black/40 border-slate-800 opacity-50"
                    : "bg-slate-800 border-slate-700 hover:border-indigo-500"
                }`}
              >
                {i >= limits.savedProfiles && (
                  <span className="text-xs">🔒</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Characters Section */}
        <div className="md:row-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
            Top Characters
          </span>
          <div className="space-y-4 overflow-y-auto h-full pr-2 custom-scrollbar">
            {profile?.topCharacters?.length > 0 ? (
              profile.topCharacters.map((char, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={char.imageUrl}
                    className="w-12 h-12 rounded-full border border-indigo-500 object-cover shadow-lg"
                    alt={char.name}
                  />
                  <span className="text-xs font-bold uppercase tracking-tight truncate">
                    {char.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-500 italic text-center mt-10">
                No Characters Deployed
              </p>
            )}
          </div>
        </div>

        {/* System Message / Transmission */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
          <div
            className={`absolute top-0 left-0 w-1 h-full ${theme.iconBg} opacity-50`}
          ></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Transmission From {profile?.username || "OPERATIVE"}
          </span>
          <p className="text-xs text-slate-400 italic leading-relaxed">
            Status:{" "}
            <span className="text-indigo-400 font-bold">
              {currentPlan.toUpperCase()}
            </span>{" "}
            access verified. All {profile?.games?.length || 0} local data nodes
            synchronized.
            {profile?.games?.length > limits.games &&
              " Warning: Some nodes locked due to security clearance."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
