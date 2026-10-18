import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks, getSelfTrackStats } from "@/lib/self-track/queries";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { formatMoney } from "@/lib/format";

export default async function SelfTrackPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [selfTracks, stats] = await Promise.all([
    listSelfTracks(user.id),
    getSelfTrackStats(user.id),
  ]);

  const netOutstanding = stats.activeLent - stats.activeBorrowed;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 sm:gap-6 px-4 sm:px-6 md:px-8 py-5 sm:py-7 pb-28 sm:pb-20 font-mono">
      {/* 1. Centred Large Page Heading */}
      <div className="text-center py-1">
        <h1 className="text-[26px] sm:text-[30px] font-black text-black dark:text-white tracking-tight uppercase">
          Private Records
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
          Private records for money lent and borrowed.
        </p>
      </div>

      {/* 2. Summary Section: 4 Metric Tiles */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Tile 1: Money Lent */}
          <div className="p-3.5 sm:p-4 border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--card)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px] flex flex-col justify-between">
            <span className="text-sm sm:text-[15px] font-bold text-[#059669] dark:text-[#2DD4BF]">
              Money Lent
            </span>
            <p className="text-2xl sm:text-[26px] font-black text-black dark:text-white mt-1.5 tracking-tight truncate">
              {formatMoney(stats.totalLent)}
            </p>
          </div>

          {/* Tile 2: Money Borrowed */}
          <div className="p-3.5 sm:p-4 border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--card)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px] flex flex-col justify-between">
            <span className="text-sm sm:text-[15px] font-bold text-[#F43F5E] dark:text-[#FB7185]">
              Money Borrowed
            </span>
            <p className="text-2xl sm:text-[26px] font-black text-black dark:text-white mt-1.5 tracking-tight truncate">
              {formatMoney(stats.totalBorrowed)}
            </p>
          </div>

          {/* Tile 3: To Collect */}
          <div className="p-3.5 sm:p-4 border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--card)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px] flex flex-col justify-between">
            <span className="text-sm sm:text-[15px] font-bold text-[#059669] dark:text-[#2DD4BF]">
              To Collect
            </span>
            <p className="text-2xl sm:text-[26px] font-black text-[#059669] dark:text-[#2DD4BF] mt-1.5 tracking-tight truncate">
              {formatMoney(stats.activeLent)}
            </p>
          </div>

          {/* Tile 4: To Repay */}
          <div className="p-3.5 sm:p-4 border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--card)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px] flex flex-col justify-between">
            <span className="text-sm sm:text-[15px] font-bold text-[#F43F5E] dark:text-[#FB7185]">
              To Repay
            </span>
            <p className="text-2xl sm:text-[26px] font-black text-[#F43F5E] dark:text-[#FB7185] mt-1.5 tracking-tight truncate">
              {formatMoney(stats.activeBorrowed)}
            </p>
          </div>
        </div>

        {/* Net Standing Compact Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-4 py-3 border-[2px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px]">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-sm sm:text-[15px] font-bold text-gray-700 dark:text-gray-300">
              Net Standing:
            </span>
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                netOutstanding > 0
                  ? "text-[#059669] dark:text-[#2DD4BF]"
                  : netOutstanding < 0
                  ? "text-[#F43F5E] dark:text-[#FB7185]"
                  : "text-black dark:text-white"
              }`}
            >
              {netOutstanding > 0 ? `+${formatMoney(netOutstanding)}` : formatMoney(netOutstanding)}
            </span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">//</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {netOutstanding > 0
                ? "You are owed more"
                : netOutstanding < 0
                ? "You owe more"
                : "All even"}
            </span>
          </div>
          {stats.settledCount > 0 && (
            <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 self-start sm:self-auto">
              {stats.settledCount} settled
            </span>
          )}
        </div>
      </div>

      {/* 3. New Record Form */}
      <div>
        <SelfTrackForm />
      </div>

      {/* 4. Private Records Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b-[2px] border-black/10 dark:border-white/20 pb-2">
          <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight">
            Entries ({selfTracks.length})
          </h2>
        </div>

        <SelfTrackList records={selfTracks} />
      </div>
    </div>
  );
}
