import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks, getSelfTrackStats } from "@/lib/self-track/queries";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { formatMoney } from "@/lib/format";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default async function SelfTrackPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [selfTracks, stats] = await Promise.all([
    listSelfTracks(user.id),
    getSelfTrackStats(user.id),
  ]);

  const netOutstanding = stats.activeLent - stats.activeBorrowed;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-5 pb-24 sm:pb-16 font-mono">
      {/* 1. Compact Page Header */}
      <div className="flex items-center justify-between gap-2 border-b-[2px] border-black/10 dark:border-white/20 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight uppercase">
              Personal Ledger
            </h1>
            <span className="px-1.5 py-0.5 rounded-[4px] border border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)] text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Private
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Private records for money lent and borrowed.
          </p>
        </div>
      </div>

      {/* 2. Compact Summary Section: 4 Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Tile 1: Money Lent */}
        <div className="p-2.5 sm:p-3 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[var(--card)] shadow-[2px_2px_0_0_#000] rounded-[6px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#2DD4BF]">
              Money Lent
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#059669] dark:text-[#2DD4BF]" />
          </div>
          <p className="text-base sm:text-lg font-black text-black dark:text-white mt-1 truncate">
            {formatMoney(stats.totalLent)}
          </p>
        </div>

        {/* Tile 2: Money Borrowed */}
        <div className="p-2.5 sm:p-3 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[var(--card)] shadow-[2px_2px_0_0_#000] rounded-[6px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#F43F5E] dark:text-[#FB7185]">
              Money Borrowed
            </span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#F43F5E] dark:text-[#FB7185]" />
          </div>
          <p className="text-base sm:text-lg font-black text-black dark:text-white mt-1 truncate">
            {formatMoney(stats.totalBorrowed)}
          </p>
        </div>

        {/* Tile 3: To Collect */}
        <div className="p-2.5 sm:p-3 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[var(--card)] shadow-[2px_2px_0_0_#000] rounded-[6px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#2DD4BF]">
              To Collect
            </span>
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
          </div>
          <p className="text-base sm:text-lg font-black text-[#059669] dark:text-[#2DD4BF] mt-1 truncate">
            {formatMoney(stats.activeLent)}
          </p>
        </div>

        {/* Tile 4: To Repay */}
        <div className="p-2.5 sm:p-3 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[var(--card)] shadow-[2px_2px_0_0_#000] rounded-[6px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#F43F5E] dark:text-[#FB7185]">
              To Repay
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
          </div>
          <p className="text-base sm:text-lg font-black text-[#F43F5E] dark:text-[#FB7185] mt-1 truncate">
            {formatMoney(stats.activeBorrowed)}
          </p>
        </div>
      </div>

      {/* Net Standing Compact Summary Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[2px_2px_0_0_#000] rounded-[6px] text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-bold text-gray-700 dark:text-gray-300 uppercase text-[10px] sm:text-xs tracking-wider">
            Net Standing:
          </span>
          <span
            className={`font-black text-sm sm:text-base ${
              netOutstanding > 0
                ? "text-[#059669] dark:text-[#2DD4BF]"
                : netOutstanding < 0
                ? "text-[#F43F5E] dark:text-[#FB7185]"
                : "text-black dark:text-white"
            }`}
          >
            {netOutstanding > 0 ? `+${formatMoney(netOutstanding)}` : formatMoney(netOutstanding)}
          </span>
          <span className="hidden xs:inline text-gray-400 dark:text-gray-500">//</span>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
            {netOutstanding > 0
              ? "You are owed more"
              : netOutstanding < 0
              ? "You owe more"
              : "All even"}
          </span>
        </div>
        {stats.settledCount > 0 && (
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 shrink-0 ml-2">
            {stats.settledCount} settled
          </span>
        )}
      </div>

      {/* 3. New Record Form */}
      <div>
        <SelfTrackForm />
      </div>

      {/* 4. Private Records Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between border-b-[2px] border-black/10 dark:border-white/20 pb-1.5">
          <h2 className="font-mono text-sm sm:text-base font-black text-black dark:text-white uppercase tracking-tight">
            Private Records ({selfTracks.length})
          </h2>
        </div>

        <SelfTrackList records={selfTracks} />
      </div>
    </div>
  );
}
