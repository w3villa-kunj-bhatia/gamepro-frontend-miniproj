import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center max-w-lg w-full">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500" />
          <h1 className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 select-none">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Mission Failed: Sector Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          The coordinates you entered lead to an uncharted void. The operative
          or resource you are looking for has either been moved or does not
          exist in our database.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95"
          >
            Return to Base
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
