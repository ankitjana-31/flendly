export default function Loading() {
  return (
    <div className="p-6 space-y-5 font-mono animate-pulse">
      <div className="h-8 w-48 bg-black/10 dark:bg-white/10 border-[2px] border-black/20" />
      <div className="h-4 w-64 bg-black/8 dark:bg-white/8 border border-black/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-[2.5px] border-black/20 dark:border-white/20 bg-white/60 dark:bg-[var(--card)]/60 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] p-5 space-y-3">
            <div className="h-4 w-24 bg-black/10 dark:bg-white/10" />
            <div className="h-8 w-32 bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-full bg-black/6 dark:bg-white/6" />
          </div>
        ))}
      </div>
      <div className="border-[2.5px] border-black/20 dark:border-white/20 bg-white/60 dark:bg-[var(--card)]/60 mt-4">
        <div className="border-b-[2px] border-black/10 px-5 py-3 h-10 bg-black/5" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-black/5 flex items-center gap-4">
            <div className="h-3 w-20 bg-black/8 dark:bg-white/8" />
            <div className="h-3 flex-1 bg-black/6 dark:bg-white/6" />
            <div className="h-3 w-16 bg-black/8 dark:bg-white/8" />
          </div>
        ))}
      </div>
    </div>
  );
}
