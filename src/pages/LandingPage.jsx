import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <main className="flex-grow pt-24 pb-20 relative overflow-hidden">
        {/* Background Gradients/Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              System Online v2.0
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
            Command Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              Gaming Legacy
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            The advanced tactical database for modern players. Track your{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Arsenal
            </span>
            , recruit your{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Squadron
            </span>
            , and unlock higher{" "}
            <span className="text-amber-500 dark:text-amber-400 font-semibold">
              Clearance Levels
            </span>
            .
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Link
              to="/signup"
              className="group relative px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <span className="relative z-10">Initialize Profile</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-2xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg"
            >
              Access Terminal
            </Link>
          </div>

          {/* Dashboard Preview / Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 dark:opacity-40 animate-pulse"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[1.7rem] shadow-2xl overflow-hidden">
              {/* Fake Browser Header */}
              <div className="h-10 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto text-xs font-mono text-gray-400">
                  gamepro://dashboard
                </div>
              </div>

              {/* Fake Dashboard Content Preview */}
              <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6 opacity-90 pointer-events-none select-none">
                {/* Card 1 */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="text-4xl mb-2">👑</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    Gold Commander
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mt-4">
                    <div className="bg-amber-500 w-3/4 h-2 rounded-full"></div>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="text-4xl mb-2">🎮</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    124 Games
                  </div>
                  <div className="text-sm text-gray-500">Added to Arsenal</div>
                </div>
                {/* Card 3 */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    Squadron Ready
                  </div>
                  <div className="text-sm text-gray-500">
                    12 Operatives Online
                  </div>
                </div>
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">
                  System Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-wide uppercase text-sm mb-3">
              Core Modules
            </h2>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">
              Tactical Advantages
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="⚔️"
              title="Build Your Arsenal"
              desc="Catalog every title you've conquered. Create a digital trophy case of your gaming history accessible anywhere."
            />
            <FeatureCard
              icon="📡"
              title="Global Network"
              desc="Scout other operatives. Analyze their stats, compare libraries, and recruit them to your personal squadron."
            />
            <FeatureCard
              icon="🔐"
              title="Secure Clearance"
              desc="Rise through the ranks from Free Agent to Gold Commander. Unlock exclusive badges and extended capabilities."
            />
          </div>
        </div>
      </section>

      {/* --- STATS BANNER --- */}
      <section className="py-20 border-y border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem label="Active Agents" value="2.4k+" />
          <StatItem label="Games Tracked" value="15k+" />
          <StatItem label="Squadrons" value="850+" />
          <StatItem label="Uptime" value="99.9%" />
        </div>
      </section>

      {/* --- FOOTER --- */}
      {/* Added pb-40 to prevent Navbar Overlap */}
      <footer className="bg-white dark:bg-slate-900 pt-10 pb-28 px-6 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
              GamePro
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              The premier destination for competitive tracking and social gaming
              management.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Directives
            </a>
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Protocol
            </a>
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-2 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-8">
          © 2026 GamePro Systems. All rights reserved. System Status: Normal.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
    <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
      {value}
    </span>
    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {label}
    </span>
  </div>
);

export default LandingPage;
