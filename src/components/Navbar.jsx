import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  // State to hold the full profile details (avatar and username)
  const [profileData, setProfileData] = useState({
    avatar: null,
    username: null,
  });

  const hideNavbarPaths = ["/login", "/signup"];

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        // Initialize with whatever data we currently have
        let currentAvatar = user.avatar || null;
        let currentUsername = user.username || null;

        // If either avatar or username is missing from the auth 'user' object, fetch the full profile
        if (!currentAvatar || !currentUsername) {
          try {
            const res = await api.get("/profile/me");
            const data = res.data?.data;

            if (data) {
              // Only update if we didn't have the data already
              if (!currentAvatar) currentAvatar = data.avatar;
              if (!currentUsername) currentUsername = data.username;
            }
          } catch (err) {
            console.error("Failed to fetch profile data for navbar", err);
          }
        }

        setProfileData({
          avatar: currentAvatar,
          username: currentUsername,
        });
      } else {
        setProfileData({ avatar: null, username: null });
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading || hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between 
                    w-[90%] max-w-lg gap-4 px-4 py-3 md:px-6 
                    bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
                    border border-white/20 dark:border-slate-700/50 
                    rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all duration-300"
    >
      <div className="flex items-center flex-shrink-0">
        <Link to="/">
          <span className="inline-block text-lg md:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">
            GamePro
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 transition-all hover:scale-110 active:scale-95"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link
              to="/dashboard"
              className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors hidden sm:block"
            >
              Dashboard
            </Link>

            <Link to="/profile" className="flex items-center space-x-2 group">
              {/* Display Username from local state, falling back to auth user, then email */}
              <span className="text-gray-700 dark:text-white font-bold hidden sm:block max-w-[80px] truncate">
                {profileData.username ||
                  user.username ||
                  user.email?.split("@")[0] ||
                  "User"}
              </span>
              <img
                src={
                  profileData.avatar ||
                  `https://ui-avatars.com/api/?name=${
                    profileData.username ||
                    user.username ||
                    user.name ||
                    user.email ||
                    "User"
                  }`
                }
                alt="Profile"
                className="w-8 h-8 rounded-full border border-blue-500 object-cover group-hover:border-white transition-colors"
              />
            </Link>

            <button
              onClick={logout}
              className="text-red-500 hover:text-red-600 transition-colors ml-1 p-1 rounded-md"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-xs md:text-sm font-bold bg-blue-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-2xl hover:bg-blue-700 transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
