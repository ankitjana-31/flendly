import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listSelfTracks, getSelfTrackStats } from "@/lib/self-track/queries";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { formatMoney } from "@/lib/format";
import { Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle2, Sparkles, Plus } from "lucide-react";

export default async function SelfTrackPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const [selfTracks, stats] = await Promise.all([
    listSelfTracks(user.id),
    getSelfTrackStats(user.id),
  ]);

  const netOutstanding = stats.activeLent - stats.activeBorrowed;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Private Personal Ledger
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Self Track
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Keep a 100% private record of cash, offline debts, and micro-loans outside of Flendly deals. 
              Never notifies other users.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Colorful GenZ Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Money Lent */}
        <div className="rounded-3xl p-5 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Money Lent</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-tabular text-foreground mt-3">
            {formatMoney(stats.totalLent)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Outstanding to collect:</span>
            <span className="font-bold text-emerald-500">{formatMoney(stats.activeLent)}</span>
          </div>
        </div>

        {/* Stat 2: Money Borrowed */}
        <div className="rounded-3xl p-5 border border-rose-500/25 bg-gradient-to-br from-rose-500/10 to-red-500/5 backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Money Borrowed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-tabular text-foreground mt-3">
            {formatMoney(stats.totalBorrowed)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Remaining to repay:</span>
            <span className="font-bold text-rose-500">{formatMoney(stats.activeBorrowed)}</span>
          </div>
        </div>

        {/* Stat 3: Net Balance */}
        <div className="rounded-3xl p-5 border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Standing</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black font-tabular mt-3 ${
            netOutstanding >= 0 ? "text-emerald-500" : "text-rose-500"
          }`}>
            {netOutstanding >= 0 ? `+${formatMoney(netOutstanding)}` : formatMoney(netOutstanding)}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {netOutstanding >= 0 ? "You are owed more than you owe" : "You have active debt to clear"}
          </div>
        </div>

        {/* Stat 4: Settled Count */}
        <div className="rounded-3xl p-5 border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Records</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-tabular text-foreground mt-3">
            {stats.settledCount}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {selfTracks.length > 0 
              ? `${Math.round((stats.settledCount / selfTracks.length) * 100)}% resolution rate`
              : "0 total entries"}
          </div>
        </div>
      </div>

      {/* Main Grid: Add Form + Records List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 sticky top-24">
          <SelfTrackForm />
        </div>

        {/* Right Column: Records */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Your Records ({selfTracks.length})
            </h2>
            <span className="text-xs text-muted-foreground">Updated in realtime</span>
          </div>

          <SelfTrackList records={selfTracks} />
        </div>
      </div>
    </div>
  );
}
