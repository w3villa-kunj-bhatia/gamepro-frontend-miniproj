const Loader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>

        <div className="absolute w-8 h-8 bg-[#6366f1] rounded-full animate-pulse blur-sm opacity-50"></div>
      </div>

      <p className="mt-4 text-[#4f46e5] font-bold tracking-widest animate-pulse uppercase text-xs">
        Loading System...
      </p>
    </div>
  );
};

export default Loader;
