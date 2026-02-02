import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

const HomeIcon = () => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
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
    className="w-5 h-5 md:w-6 md:h-6"
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
    className="w-5 h-5 md:w-6 md:h-6"
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
    className="w-5 h-5 md:w-6 md:h-6"
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
    className="w-5 h-5 md:w-6 md:h-6"
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
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    avatar: null,
    username: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await api.get("/profile/me");
        setProfileData({
          avatar: res.data?.data?.avatar || user.avatar,
          username: res.data?.data?.username || user.username,
        });
      } catch {}
    };
    fetchProfile();
  }, [user]);

  if (loading || ["/login", "/signup"].includes(location.pathname)) return null;

  const DockItem = ({ to, onClick, icon, isActive, colorClass, label }) => {
    const base =
      "group relative flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl transition-all hover:-translate-y-2 hover:scale-110";
    const active = isActive
      ? "bg-white/20 dark:bg-white/10"
      : "hover:bg-white/10 dark:hover:bg-white/5";

    const content = (
      <>
        <div
          className={isActive ? colorClass : "text-gray-500 dark:text-gray-400"}
        >
          {icon}
        </div>
        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded-md">
          {label}
        </span>
      </>
    );

    return to ? (
      <Link to={to} className={`${base} ${active}`}>
        {content}
      </Link>
    ) : (
      <button onClick={onClick} className={`${base} ${active}`}>
        {content}
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50
                 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-auto"
    >
      <div
        className="flex items-center justify-start md:justify-center gap-1 md:gap-2
                   px-2 py-2 md:px-4 md:py-3
                   bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl
                   border border-white/20 dark:border-slate-700/50
                   rounded-3xl shadow-lg overflow-x-auto no-scrollbar"
      >
        <DockItem
          to="/"
          icon={<HomeIcon />}
          label="Home"
          isActive={location.pathname === "/"}
          colorClass="text-blue-600"
        />

        {user && (
          <>
            <DockItem
              to="/dashboard"
              icon={<DashboardIcon />}
              label="Dashboard"
              isActive={location.pathname === "/dashboard"}
              colorClass="text-indigo-600"
            />

            {user.role === "admin" && (
              <DockItem
                to="/admin/users"
                icon={<AdminIcon />}
                label="Admin"
                isActive={location.pathname.startsWith("/admin")}
                colorClass="text-red-600"
              />
            )}

            <DockItem
              to="/plans"
              icon={<CrownIcon />}
              label="Membership"
              isActive={location.pathname === "/plans"}
              colorClass="text-amber-500"
            />

            <Link to="/profile" className="mx-1">
              <img
                src={
                  profileData.avatar ||
                  `https://ui-avatars.com/api/?name=${profileData.username || user.email}`
                }
                className="w-9 h-9 rounded-full border-2 border-white"
                alt="Profile"
              />
            </Link>

            <DockItem onClick={logout} icon={<LogoutIcon />} label="Logout" />
          </>
        )}

        <button
          onClick={toggleTheme}
          className="flex-shrink-0 min-w-[44px] p-2 md:p-3 rounded-full
                     hover:bg-gray-100 dark:hover:bg-slate-800
                     text-gray-500 dark:text-yellow-400"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
