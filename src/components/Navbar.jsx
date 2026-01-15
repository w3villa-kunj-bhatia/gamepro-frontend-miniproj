import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  const hideNavbarPaths = ["/login", "/signup"];

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
        <Link
          to="/"
          className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none"
        >
          GamePro
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
              <span className="text-white font-bold hidden sm:block max-w-[80px] truncate">
                {user?.username || user?.email?.split("@")[0] || "User"}
              </span>
              <img
                src={
                  user.profilePicture ||
                  `https://ui-avatars.com/api/?name=${
                    user.name || user.email || "User"
                  }`
                }
                alt="Profile"
                className="w-8 h-8 rounded-full border border-blue-500 object-cover group-hover:border-white transition-colors"
              />
            </Link>

            <button
              onClick={logout}
              className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors ml-1"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden text-lg">✖</span>
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
