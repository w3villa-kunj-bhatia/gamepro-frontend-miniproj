import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Main Content Area */}
      <main className="flex-grow pt-12 pb-24">
        {/* Hero Section */}
        <header className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
            The Ultimate Platform for{" "}
            <span className="text-blue-600">Gamers</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Discover new games, track your progress, and connect with a
            community of players worldwide. Everything you need to level up your
            gaming experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-lg transition-all"
            >
              Join GamePro Now
            </Link>
            <button className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
              Learn More
            </button>
          </div>
        </header>

        {/* Features Section - Updated with dark:bg-slate-900 */}
        <section className="bg-white dark:bg-slate-950  py-20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
              Why Choose GamePro?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Cards updated for Dark Mode */}
              <div className="p-8 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  Instant Stats
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get real-time performance tracking and detailed analytics for
                  all your titles.
                </p>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  Global Community
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with millions of players, join guilds, and compete in
                  tournaments.
                </p>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  Secure Profiles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced security features ensure your gaming data remains
                  protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Positioned naturally at the end of flex column */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold mb-4 md:mb-0">GamePro</div>
          <div className="flex gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="mt-8 md:mt-0 text-gray-500">
            © 2024 GamePro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
