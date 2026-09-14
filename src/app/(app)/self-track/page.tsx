import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks, getSelfTrackStats } from "@/lib/self-track/queries";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { formatMoney } from "@/lib/format";
import { RetroWindow } from "@/components/ui/retro-window";
import { Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default async function SelfTrackPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [selfTracks, stats] = await Promise.all([
    listSelfTracks(user.id),
    getSelfTrackStats(user.id),
  ]);

  const netOutstanding = stats.activeLent - stats.activeBorrowed;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16">
      {/* Retro OS Header Banner */}
      <RetroWindow
        title="PRIVATE LEDGER // OFFLINE TRACKER"
        subtitle="standalone cash records"
        colorBar="blue"
        glow={true}
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#2563EB]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-black bg-[#FFE600] text-black font-mono text-[10px] font-black uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% PRIVATE DATA</span>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#2DD4BF] text-black border-[1.5px] border-black font-mono text-xs font-bold uppercase shadow-[1.5px_1.5px_0_0_#000]">
              <span>🔒</span>
              <span>STANDALONE VAULT</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white uppercase">
              Personal Cash & Offline Ledger
            </h1>
            <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Log split bills, informal cash loans, or IOUs. Zero notifications are sent to counterparties.
            </p>
          </div>
          <div className="p-3 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] font-mono text-xs text-black dark:text-white shadow-[2px_2px_0_0_#000] shrink-0">
            <span className="text-gray-500 block text-[10px] font-bold uppercase">LEDGER INTEGRITY</span>
            <span className="text-[#059669] dark:text-[#2DD4BF] font-black flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              LOCAL SESSION SECURE
            </span>
          </div>
        </div>
      </RetroWindow>

      {/* 4 Neo-Brutalist Summary Stat Windows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Stat 1: Money Lent */}
        <div className="p-4 border-[2.5px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#10B981] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-[#2DD4BF]">
              Money Lent
            </span>
            <div className="w-6 h-6 border border-black bg-[#2DD4BF] text-black flex items-center justify-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-mono text-2xl font-black text-black dark:text-white mt-2">
            {formatMoney(stats.totalLent)}
          </p>
          <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-[11px] text-gray-600 dark:text-gray-400">
            <span>To collect:</span>
            <span className="font-bold text-[#059669] dark:text-[#2DD4BF]">{formatMoney(stats.activeLent)}</span>
          </div>
        </div>

        {/* Stat 2: Money Borrowed */}
        <div className="p-4 border-[2.5px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#F43F5E] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#F43F5E]">
              Money Borrowed
            </span>
            <div className="w-6 h-6 border border-black bg-[#F43F5E] text-white flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-mono text-2xl font-black text-black dark:text-white mt-2">
            {formatMoney(stats.totalBorrowed)}
          </p>
          <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-[11px] text-gray-600 dark:text-gray-400">
            <span>To repay:</span>
            <span className="font-bold text-[#F43F5E]">{formatMoney(stats.activeBorrowed)}</span>
          </div>
        </div>

        {/* Stat 3: Net Balance */}
        <div className="p-4 border-[2.5px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#2563EB] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
              Net Standing
            </span>
            <div className="w-6 h-6 border border-black bg-[#2563EB] text-white flex items-center justify-center font-bold">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`font-mono text-2xl font-black mt-2 ${
            netOutstanding >= 0 ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"
          }`}>
            {netOutstanding >= 0 ? `+${formatMoney(netOutstanding)}` : formatMoney(netOutstanding)}
          </p>
          <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 font-mono text-[10px] text-gray-500 truncate">
            {netOutstanding >= 0 ? "Surplus: You are owed more" : "Active personal debt to clear"}
          </div>
        </div>

        {/* Stat 4: Settled Count */}
        <div className="p-4 border-[2.5px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#FFE600] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-gray-300">
              Settled Logs
            </span>
            <div className="w-6 h-6 border border-black bg-[#FFE600] text-black flex items-center justify-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-mono text-2xl font-black text-black dark:text-white mt-2">
            {stats.settledCount}
          </p>
          <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 font-mono text-[11px] text-gray-600 dark:text-gray-400">
            {selfTracks.length > 0 
              ? `${Math.round((stats.settledCount / selfTracks.length) * 100)}% resolution rate`
              : "0 total entries"}
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left + Records List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (only sticky on large desktop screens to prevent mobile overlap) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 relative z-10">
          <SelfTrackForm />
        </div>

        {/* Right Column: Records */}
        <div className="lg:col-span-7 space-y-4 relative z-0">
          <div className="flex items-center justify-between border-b-[2px] border-black dark:border-white/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">[ENTRIES]</span>
              <h2 className="font-mono text-base font-bold text-black dark:text-white uppercase tracking-tight">
                Your Private Records ({selfTracks.length})
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">Live synced</span>
          </div>

          <SelfTrackList records={selfTracks} />
        </div>
      </div>
    </div>
  );
}
