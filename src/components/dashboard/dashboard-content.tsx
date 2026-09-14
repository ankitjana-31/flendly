"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatDate, daysUntil } from "@/lib/format";
import { clientListSelfTracks } from "@/lib/self-track/client";
import { RetroWindow } from "@/components/ui/retro-window";
import { ArrowUpRight, ArrowDownLeft, Calendar, FileText, Plus, ExternalLink } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

export interface DashboardContentProps {
  profile: any;
  aggregates: any;
  requests: any;
  openRequests: any[];
  hasCompletedDeals: boolean;
  selfTrackStats: any;
  selfTracks: any[];
  userId: string;
}

export function DashboardContent({
  profile,
  aggregates,
  requests,
  openRequests,
  hasCompletedDeals,
  selfTrackStats,
  selfTracks: initialSelfTracks,
  userId,
}: DashboardContentProps) {
  const [selfTracks, setSelfTracks] = useState(initialSelfTracks || []);

  const handleSelfTrackRefresh = async () => {
    try {
      const updated = await clientListSelfTracks(userId);
      setSelfTracks(updated);
    } catch (error) {
      console.error("Failed to refresh self tracks:", error);
    }
  };

  // Compute offline lent and borrowed sums
  const personalLentActive = selfTracks
    .filter((r) => r.type === "lent" && r.status === "active")
    .reduce((acc, r) => {
      const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
      return acc + Math.max(0, Number(r.amount) - paid);
    }, 0);

  const personalBorrowedActive = selfTracks
    .filter((r) => r.type === "borrowed" && r.status === "active")
    .reduce((acc, r) => {
      const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
      return acc + Math.max(0, Number(r.amount) - paid);
    }, 0);

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto flex flex-col gap-5 px-4 sm:px-6 md:px-8 py-4 md:py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Retro Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1.5 border-b-[2px] border-black/10 dark:border-[#1E2935] pb-4"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-bold">[SYS.SESSION_ACTIVE]</span>
          <span className="text-gray-400 font-mono text-xs">//</span>
          <span className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">FLENDLY.OS MASTER DASHBOARD</span>
        </div>
        <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black dark:text-white">
          Welcome back, {profile?.full_name ?? `@${profile?.username}`}
        </h1>
      </motion.header>

      {/* Main Retro Stats Windows */}
      <motion.div
        className="grid gap-5 sm:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <RetroWindow
            title="RECEIVABLES.sys // INCOMING"
            subtitle="owed_to_you"
            colorBar="green"
            glow={aggregates.totalLent > 0}
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#059669]"
            contentClassName="p-5 sm:p-6"
            headerRight={
              <span className="px-2.5 py-0.5 border border-black bg-[#2DD4BF] text-black font-mono text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
                +INCOMING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-black uppercase tracking-wider">
                You&apos;re owed
              </p>
              <motion.p
                className="mt-2 font-mono text-4xl sm:text-5xl font-black text-[#059669] dark:text-[#2DD4BF] tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              >
                {formatMoney(aggregates.totalLent)}
              </motion.p>
              <p className="mt-2 font-mono text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold">
                across {aggregates.activeLentCount} active loan{aggregates.activeLentCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </div>

        <div>
          <RetroWindow
            title="PAYABLES.sys // OUTGOING"
            subtitle="you_owe"
            colorBar="pink"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#F43F5E]"
            contentClassName="p-5 sm:p-6"
            headerRight={
              <span className="px-2.5 py-0.5 border border-black bg-[#F43F5E] text-white font-mono text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
                -OUTGOING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-black uppercase tracking-wider">
                You owe
              </p>
              <motion.p
                className="mt-2 font-mono text-4xl sm:text-5xl font-black text-[#F43F5E] tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              >
                {formatMoney(aggregates.totalBorrowed)}
              </motion.p>
              <p className="mt-2 font-mono text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold">
                across {aggregates.activeBorrowedCount} active loan{aggregates.activeBorrowedCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </div>
      </motion.div>

      {/* Overdue Section - Conditional Retro Window */}
      {hasCompletedDeals && aggregates.overdue.length > 0 && (
        <RetroWindow
          title="OVERDUE_ALERTS.sys // ACTION_REQUIRED"
          subtitle="past_due_date"
          colorBar="pink"
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
          contentClassName="p-5"
          headerRight={
            <span className="px-2.5 py-0.5 border border-black bg-[#F43F5E] text-white font-mono text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
              {aggregates.overdue.length} OVERDUE
            </span>
          }
        >
          <ul className="flex flex-col gap-3 font-mono">
            {aggregates.overdue.map((loan: any) => (
              <li key={loan.id}>
                <a
                  href={`/loans/${loan.id}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white hover:bg-[#FFE600] hover:text-black transition-all shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  <div>
                    <span className="font-bold text-sm sm:text-base block">
                      {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                      <span className="text-[#F43F5E] font-black">{formatMoney(loan.ledger?.outstanding)}</span>
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 block">Click to view deal details and repayment ledger</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black bg-[#F43F5E] text-white px-2.5 py-1 border border-black shadow-[1px_1px_0_0_#000] uppercase">
                    DUE {formatDate(loan.due_date)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </RetroWindow>
      )}

      {/* Due Soon Section - Conditional Retro Window */}
      {hasCompletedDeals && aggregates.upcoming.length > 0 && (
        <RetroWindow
          title="UPCOMING_DUE.sys // TIMELINE"
          subtitle="due_soon"
          colorBar="yellow"
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
          contentClassName="p-5"
          headerRight={
            <span className="px-2.5 py-0.5 border border-black bg-[#FFE600] text-black font-mono text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
              {aggregates.upcoming.length} UPCOMING
            </span>
          }
        >
          <ul className="flex flex-col gap-3 font-mono">
            {aggregates.upcoming.map((loan: any) => (
              <li key={loan.id}>
                <a
                  href={`/loans/${loan.id}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white hover:bg-[#FFE600] hover:text-black transition-all shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  <span className="font-bold text-sm sm:text-base">
                    {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                    <span className="font-black text-[#2563EB] dark:text-[#60A5FA]">{formatMoney(loan.ledger?.outstanding)}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold bg-[#FFE600] text-black px-2.5 py-1 border border-black shadow-[1px_1px_0_0_#000] uppercase">
                    {daysUntil(loan.due_date) === 0 ? "DUE TODAY" : `DUE IN ${daysUntil(loan.due_date)}D`}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </RetroWindow>
      )}

      {/* Loan Summary Section */}
      {hasCompletedDeals && (
        <RetroWindow
          title="LEDGER_TOTALS.sys // LIFETIME_SUMMARY"
          subtitle="aggregate_view"
          colorBar="blue"
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
          contentClassName="p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 font-mono">
            <div className="p-4 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
              <p className="text-xs sm:text-sm font-bold uppercase text-gray-600 dark:text-gray-300">Total Lifetime Lent</p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-[#059669] dark:text-[#2DD4BF]">
                {formatMoney(aggregates.totalLent)}
              </p>
            </div>
            <div className="p-4 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
              <p className="text-xs sm:text-sm font-bold uppercase text-gray-600 dark:text-gray-300">Total Lifetime Borrowed</p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-[#F43F5E]">
                {formatMoney(aggregates.totalBorrowed)}
              </p>
            </div>
          </div>
        </RetroWindow>
      )}

      {/* Open Requests Section */}
      <motion.section
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">[REQUESTS.sys]</span>
            <h2 className="font-mono text-base sm:text-lg font-black text-black dark:text-white uppercase tracking-tight">Open Requests</h2>
          </div>
          <LinkButton href="/requests/new" size="sm" className="bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs sm:text-sm font-black shadow-[3px_3px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all cursor-pointer">
            + New request
          </LinkButton>
        </div>

        {openRequests.length === 0 ? (
          <div className="border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] p-6 text-center shadow-[3px_3px_0_0_#000]">
            <p className="font-mono text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">
              No open requests. Start a new peer deal with the button above.
            </p>
          </div>
        ) : (
          <motion.div className="flex flex-col gap-2.5" variants={containerVariants} initial="hidden" animate="visible">
            {openRequests.slice(0, 5).map((r: any) => {
              const other = r.sender.id === userId ? r.receiver : r.sender;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                  <a
                    href={`/requests/${r.id}`}
                    className="flex items-center justify-between p-4 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] shadow-[3px_3px_0_0_#000] hover:bg-[#FEF08A] hover:text-black dark:hover:bg-[#1E212D] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all font-mono"
                  >
                    <div>
                      <p className="font-mono text-sm sm:text-base font-black">
                        {other.full_name ?? `@${other.username}`} ·{" "}
                        {r.active_offer ? formatMoney(r.active_offer.amount) : "—"}
                      </p>
                      <p className="font-mono text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                        {r.sender.id === userId ? "You sent" : "Sent to you"} ·{" "}
                        {r.direction === "lend" ? "you lend" : "you borrow"}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.section>

      {/* Personal Tracker (Self Track) Overview Section */}
      <motion.section
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <RetroWindow
          title="PERSONAL_TRACKER.sys // OFFLINE_LEDGER"
          subtitle="self_track_summary"
          colorBar="yellow"
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
          contentClassName="p-5 sm:p-6"
          headerRight={
            <a
              href="/self-track"
              className="px-3 py-1 border border-black bg-[#FFE600] text-black font-mono text-xs font-black shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>MANAGE LEDGER</span>
              <span>→</span>
            </a>
          }
        >
          <div className="flex flex-col gap-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-mono text-sm sm:text-base font-black text-black dark:text-white uppercase">
                  Private Cash & Offline Records
                </h3>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  100% private to you · Untracked by other users
                </p>
              </div>
              <div className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 border border-purple-300 dark:border-purple-800 self-start sm:self-auto shadow-[1px_1px_0_0_#000]">
                {selfTracks.length} TOTAL RECORD{selfTracks.length !== 1 ? "S" : ""}
              </div>
            </div>

            {/* Borrowed vs Lent Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Personal Lent */}
              <div className="p-4 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-black text-[#059669] dark:text-[#2DD4BF] uppercase">
                    Money You Lent (Offline)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 border border-emerald-300 font-bold">
                    {selfTracks.filter((r) => r.type === "lent" && r.status === "active").length} ACTIVE
                  </span>
                </div>
                <p className="font-mono text-2xl sm:text-3xl font-black text-[#059669] dark:text-[#2DD4BF] mt-1">
                  {formatMoney(personalLentActive)}
                </p>
                <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Outstanding to collect from friends
                </p>
              </div>

              {/* Personal Borrowed */}
              <div className="p-4 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-black text-[#F43F5E] uppercase">
                    Money You Borrowed (Offline)
                  </span>
                  <span className="font-mono text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.5 border border-rose-300 font-bold">
                    {selfTracks.filter((r) => r.type === "borrowed" && r.status === "active").length} ACTIVE
                  </span>
                </div>
                <p className="font-mono text-2xl sm:text-3xl font-black text-[#F43F5E] mt-1">
                  {formatMoney(personalBorrowedActive)}
                </p>
                <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Remaining debt for you to repay
                </p>
              </div>
            </div>

            {/* Recent Personal Track Entries Snippet */}
            {selfTracks.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
                  <span className="uppercase tracking-wider">RECENT OFFLINE ENTRIES ({selfTracks.length})</span>
                  <a href="/self-track" className="text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline flex items-center gap-1">
                    Manage & Record New →
                  </a>
                </div>
                <div className="grid gap-2">
                  {selfTracks.slice(0, 4).map((r) => {
                    const isLent = r.type === "lent";
                    const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                    const remaining = Math.max(0, Number(r.amount) - paid);
                    const isSettled = r.status === "settled" || remaining === 0;
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 border-[1.5px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] text-xs sm:text-sm font-mono shadow-[2px_2px_0_0_#000]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                              isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                            }`}
                          >
                            {isLent ? "LENT" : "BORROWED"}
                          </span>
                          <span className="font-bold text-black dark:text-white">
                            {r.person_name}
                          </span>
                          {r.note && (
                            <span className="hidden sm:inline text-xs text-gray-500 italic truncate max-w-[180px]">
                              ({r.note})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-sm sm:text-base ${isLent ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"}`}>
                            {formatMoney(remaining > 0 ? remaining : Number(r.amount))}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 border border-black uppercase ${
                            isSettled ? "bg-[#10B981] text-black" : "bg-[#FFE600] text-black"
                          }`}>
                            {isSettled ? "SETTLED" : "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selfTracks.length === 0 && (
              <div className="p-4 border border-dashed border-black/30 dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] text-center font-mono text-xs sm:text-sm text-gray-500">
                No offline cash tracks recorded yet. Keep private notes on informal debts anytime.
              </div>
            )}
          </div>
        </RetroWindow>
      </motion.section>
    </motion.div>
  );
}

