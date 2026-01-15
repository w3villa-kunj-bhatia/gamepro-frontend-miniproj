import { Link, useLocation } from "react-router-dom"; // Added useLocation
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const location = useLocation(); // Hook to get current route

  // Define paths where the Navbar should be hidden
  const hideNavbarPaths = ["/login", "/signup"];

  // Return null if currently on login/signup or if authentication is loading
  if (loading || hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between 
                    w-max min-w-[450px] gap-8 px-6 py-3 
                    bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
                    border border-white/20 dark:border-slate-700/50 
                    rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center">
        <Link
          to="/"
          className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
          }}
        >
          GamePro
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 transition-all"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="flex items-center space-x-2 group">
              <span className="text-white font-bold">
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
                className="w-8 h-8 rounded-full border border-blue-500 object-cover"
              />
            </Link>
            <button
              onClick={logout}
              className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-2xl hover:bg-blue-700 transition-all"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
