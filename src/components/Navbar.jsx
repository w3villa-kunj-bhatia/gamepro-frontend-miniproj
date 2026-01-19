import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

const HomeIcon = () => (
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
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const DashboardIcon = () => (
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
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const CrownIcon = () => (
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const LogoutIcon = () => (
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
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const AdminIcon = () => (
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
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    />
  </svg>
);

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  const [profileData, setProfileData] = useState({
    avatar: null,
    username: null,
  });

  const hideNavbarPaths = ["/login", "/signup"];

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        let currentAvatar = user.avatar || null;
        let currentUsername = user.username || null;

        if (!currentAvatar || !currentUsername) {
          try {
            const res = await api.get("/profile/me");
            const data = res.data?.data;
            if (data) {
              if (!currentAvatar) currentAvatar = data.avatar;
              if (!currentUsername) currentUsername = data.username;
            }
          } catch (err) {
            console.error("Navbar profile fetch error", err);
          }
        }
        setProfileData({ avatar: currentAvatar, username: currentUsername });
      } else {
        setProfileData({ avatar: null, username: null });
      }
    };
    fetchProfileData();
  }, [user]);

  if (loading || hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  const DockItem = ({ to, onClick, icon, label, isActive, colorClass }) => {
    const baseClass =
      "group relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110";
    const activeClass = isActive
      ? "bg-white/20 dark:bg-white/10 shadow-inner"
      : "hover:bg-white/10 dark:hover:bg-white/5";
    const content = (
      <>
        <div
          className={`${
            isActive
              ? colorClass
              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          }`}
        >
          {icon}
        </div>
        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
          {label}
        </span>
        {isActive && (
          <div
            className={`absolute -bottom-1 w-1 h-1 rounded-full ${colorClass.replace(
              "text-",
              "bg-"
            )}`}
          ></div>
        )}
      </>
    );

    if (to) {
      return (
        <Link to={to} className={`${baseClass} ${activeClass}`}>
          {content}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={`${baseClass} ${activeClass}`}>
        {content}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw]">
      <div
        className="flex items-center gap-2 px-3 py-3 md:px-4 md:py-3
                      bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl
                      border border-white/20 dark:border-slate-700/50 
                      rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]
                      ring-1 ring-black/5 dark:ring-white/10"
      >
        <DockItem
          to="/"
          icon={<HomeIcon />}
          label="Home"
          isActive={location.pathname === "/"}
          colorClass="text-blue-600 dark:text-blue-400"
        />

        <div className="w-px h-8 bg-gray-300/50 dark:bg-gray-700/50 mx-1"></div>

        {user ? (
          <>
            <DockItem
              to="/dashboard"
              icon={<DashboardIcon />}
              label="Dashboard"
              isActive={location.pathname === "/dashboard"}
              colorClass="text-indigo-600 dark:text-indigo-400"
            />

            {user.role === "admin" && (
              <DockItem
                to="/admin/users"
                icon={<AdminIcon />}
                label="Admin Panel"
                isActive={location.pathname.startsWith("/admin")}
                colorClass="text-red-600 dark:text-red-400"
              />
            )}

            <DockItem
              to="/plans"
              icon={<CrownIcon />}
              label="Membership"
              isActive={location.pathname === "/plans"}
              colorClass="text-amber-500"
            />

            <div className="w-px h-8 bg-gray-300/50 dark:bg-gray-700/50 mx-1"></div>

            <Link
              to="/profile"
              className="group relative mx-1 transition-all duration-300 hover:-translate-y-2 hover:scale-110"
            >
              <img
                src={
                  profileData.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    profileData.username || user.email
                  }&background=random`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover group-hover:border-blue-500"
              />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none">
                Profile
              </span>
            </Link>

            <DockItem
              onClick={logout}
              icon={<LogoutIcon />}
              label="Logout"
              isActive={false}
              colorClass="text-red-500"
            />
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-all"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/30"
            >
              Get Started
            </Link>
          </>
        )}

        <div className="w-px h-8 bg-gray-300/50 dark:bg-gray-700/50 mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-yellow-400 transition-all hover:-translate-y-1 hover:scale-110"
          title="Toggle Theme"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
