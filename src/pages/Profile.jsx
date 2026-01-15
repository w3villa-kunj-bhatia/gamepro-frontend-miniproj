import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500",
      shadow: "shadow-amber-500/20",
      textColor: "text-amber-500",
    },
    silver: {
      emoji: "⚔️",
      label: "Silver Member",
      bgColor: "bg-slate-300/10",
      borderColor: "border-slate-300/20",
      iconBg: "bg-slate-400",
      shadow: "shadow-slate-400/20",
      textColor: "text-slate-300",
    },
    free: {
      emoji: "💪",
      label: "Free Member",
      bgColor: "bg-indigo-600/10",
      borderColor: "border-indigo-600/20",
      iconBg: "bg-indigo-600",
      shadow: "shadow-indigo-600/20",
      textColor: "text-indigo-400",
    },
  };

  const theme = planConfigs[currentPlan] || planConfigs.free;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 pt-24 pb-36 transition-colors duration-500">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-min">
        <div className="md:col-span-1 lg:row-span-3 bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center shadow-xl relative overflow-hidden group">
          <div
            className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${theme.bgColor.replace(
              "/10",
              "/5"
            )} to-transparent opacity-50`}
          />
          <div className="text-center w-full relative z-10 flex-1 flex flex-col items-center">
            <div className="relative inline-block mb-6 mt-4">
              <img
                src={
                  profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    profile?.username || "User"
                  }&background=random`
                }
                className={`w-36 h-36 rounded-full mx-auto border-4 ${theme.borderColor} shadow-2xl object-cover`}
                alt="Avatar"
              />
              <div
                className={`absolute bottom-2 right-2 w-10 h-10 ${theme.iconBg} rounded-full border-4 border-slate-900 flex items-center justify-center text-lg shadow-lg`}
              >
                {theme.emoji}
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter truncate w-full">
              {profile?.username || "Operative"}
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-medium truncate w-full mb-8">
              📍 {profile?.address || "Location Hidden"}
            </p>
            <Link
              to="/create-profile"
              className="mt-auto w-full bg-slate-800 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
            >
              Edit Identity
            </Link>
          </div>
        </div>

        <div
          className={`md:col-span-2 lg:col-span-1 min-h-[160px] ${theme.bgColor} ${theme.borderColor} border rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}
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
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
            Current Tier
          </p>
        </div>

        <div className="md:col-span-2 lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 overflow-hidden relative">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Deployments ({profile?.games?.length || 0} / {limits.games})
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
                        : "border-slate-700 group-hover:border-indigo-500"
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
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-2xl drop-shadow-lg">🔒</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {[
              ...Array(
                Math.max(0, limits.games - (profile?.games?.length || 0))
              ),
            ].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-24 aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center opacity-50"
              >
                <span className="text-slate-700 text-xs font-bold">EMPTY</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 relative overflow-hidden flex items-center min-h-[70px]">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${theme.iconBg} opacity-80`}
          />
          <p className="text-xs font-mono text-slate-400 pl-4 leading-relaxed">
            <span className="text-indigo-400 font-bold">SYSTEM_LOG:</span>{" "}
            Synchronization complete. Status:{" "}
            <span className={`${theme.textColor} font-bold`}>
              {currentPlan.toUpperCase()}
            </span>
            .
            {profile?.games?.length > 0
              ? " Data nodes active."
              : " Awaiting input."}
          </p>
        </div>

        <div className="md:col-span-1 lg:col-span-1 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
            Network ({limits.savedProfiles})
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center ${
                  i >= limits.savedProfiles
                    ? "bg-black/20 border-slate-800/50"
                    : "bg-slate-800/30 border-slate-700 hover:border-indigo-500"
                }`}
              >
                {i >= limits.savedProfiles ? (
                  <span className="text-slate-700">🔒</span>
                ) : (
                  <span className="text-slate-600">+</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className=" lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
            Squadron (Characters)
          </span>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {profile?.topCharacters?.length > 0 ? (
              profile.topCharacters.map((char, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center gap-3 bg-slate-800/50 pr-4 pl-1 py-1 rounded-full border border-slate-700/50"
                >
                  <img
                    src={char.imageUrl}
                    className="w-10 h-10 rounded-full border border-indigo-500/50 object-cover"
                    alt={char.name}
                  />
                  <span className="text-xs font-bold uppercase tracking-tight text-slate-300 whitespace-nowrap">
                    {char.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No Squad Deployed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
