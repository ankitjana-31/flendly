"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      staggerChildren: 0.06,
      delayChildren: 0.05,
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
  const router = useRouter();
  const [selfTracks, setSelfTracks] = useState(initialSelfTracks || []);
  const [hideSelfTrack, setHideSelfTrack] = useState(false);

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
      className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-5 px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 min-w-0 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Retro Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-1 border-b-[2px] border-black/10 dark:border-[#1E2935] pb-2.5 sm:pb-3.5"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">[SESSION ACTIVE]</span>
          <span className="hidden sm:inline text-gray-400 font-mono text-xs">//</span>
          <span className="hidden sm:inline font-mono text-xs text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider">FLENDLY MASTER DASHBOARD</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black dark:text-white truncate">
          Welcome back, {profile?.full_name ?? ("@" + profile?.username)}
        </h1>
      </motion.header>

      {/* Main Retro Stats Windows */}
      <motion.div
        className="grid gap-3.5 sm:gap-4.5 sm:grid-cols-2 w-full min-w-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
      >
        <div className="w-full min-w-0">
          <RetroWindow
            title={<><span>RECEIVABLES</span><span className="hidden sm:inline"> // INCOMING</span></>}
            subtitle="owed to you"
            colorBar="green"
            glow={aggregates.totalLent > 0}
            className="bg-white max-sm:bg-[#2DD4BF] dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#059669]"
            contentClassName="p-4 sm:p-5"
            headerRight={
              <span className="px-2 sm:px-2.5 py-0.5 border border-black bg-[#2DD4BF] text-black font-mono text-[11px] sm:text-xs font-black uppercase shadow-[1px_1px_0_0_#000]">
                +INCOMING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-black uppercase tracking-wider">
                You&apos;re owed
              </p>
              <motion.p
                className="mt-1 font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-[#059669] dark:text-[#2DD4BF] tracking-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              >
                {formatMoney(aggregates.totalLent)}
              </motion.p>
              <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400 font-bold">
                <span className="hidden sm:inline">across </span>{aggregates.activeLentCount} active loan{aggregates.activeLentCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </div>

        <div className="w-full min-w-0">
          <RetroWindow
            title={<><span>PAYABLES</span><span className="hidden sm:inline"> // OUTGOING</span></>}
            subtitle="you owe"
            colorBar="pink"
            className="bg-white max-sm:bg-[#F43F5E] dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#F43F5E]"
            contentClassName="p-4 sm:p-5"
            headerRight={
              <span className="px-2 sm:px-2.5 py-0.5 border border-black bg-[#F43F5E] text-white font-mono text-[11px] sm:text-xs font-black uppercase shadow-[1px_1px_0_0_#000]">
                -OUTGOING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-black uppercase tracking-wider">
                You owe
              </p>
              <motion.p
                className="mt-1 font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-[#F43F5E] tracking-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 120 }}
              >
                {formatMoney(aggregates.totalBorrowed)}
              </motion.p>
              <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400 font-bold">
                <span className="hidden sm:inline">across </span>{aggregates.activeBorrowedCount} active loan{aggregates.activeBorrowedCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </div>
      </motion.div>

      {/* Overdue Section - Conditional Retro Window */}
      {hasCompletedDeals && aggregates.overdue.length > 0 && (
        <div className="w-full min-w-0">
          <RetroWindow
            title={<><span>OVERDUE ALERTS</span><span className="hidden sm:inline"> // ACTION REQUIRED</span></>}
            subtitle="past due date"
            colorBar="pink"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] w-full"
            contentClassName="p-3.5 sm:p-4"
            headerRight={
              <span className="px-2 py-0.5 border border-black bg-[#F43F5E] text-white font-mono text-[10px] sm:text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
                {aggregates.overdue.length} OVERDUE
              </span>
            }
          >
            <ul className="flex flex-col gap-2.5 font-mono w-full">
              {aggregates.overdue.map((loan: any) => (
                <li key={loan.id} className="w-full min-w-0">
                  <a
                    href={`/loans/${loan.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white hover:bg-[#FFE600] hover:text-black transition-all shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 w-full"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-sm sm:text-base block truncate">
                        {loan.counterparty.full_name ?? ("@" + loan.counterparty.username)} ·{" "}
                        <span className="text-[#F43F5E] font-black">{formatMoney(loan.ledger?.outstanding)}</span>
                      </span>
                      <span className="hidden sm:block text-[11px] text-gray-500 truncate">Click to view deal details and repayment ledger</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-black bg-[#F43F5E] text-white px-2 py-0.5 border border-black shadow-[1px_1px_0_0_#000] uppercase shrink-0 self-start sm:self-auto">
                      DUE {formatDate(loan.due_date)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </RetroWindow>
        </div>
      )}

      {/* Due Soon Section - Conditional Retro Window */}
      {hasCompletedDeals && aggregates.upcoming.length > 0 && (
        <div className="w-full min-w-0">
          <RetroWindow
            title={<><span>UPCOMING DUE</span><span className="hidden sm:inline"> // TIMELINE</span></>}
            subtitle="due soon"
            colorBar="yellow"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] w-full"
            contentClassName="p-3.5 sm:p-4"
            headerRight={
              <span className="px-2 py-0.5 border border-black bg-[#FFE600] text-black font-mono text-[10px] sm:text-xs font-bold uppercase shadow-[1px_1px_0_0_#000]">
                {aggregates.upcoming.length} UPCOMING
              </span>
            }
          >
            <ul className="flex flex-col gap-2.5 font-mono w-full">
              {aggregates.upcoming.map((loan: any) => (
                <li key={loan.id} className="w-full min-w-0">
                  <a
                    href={`/loans/${loan.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 border-[2px] border-black dark:border-white/40 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white hover:bg-[#FFE600] hover:text-black transition-all shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 w-full"
                  >
                    <span className="font-bold text-sm sm:text-base truncate">
                      {loan.counterparty.full_name ?? ("@" + loan.counterparty.username)} ·{" "}
                      <span className="font-black text-[#2563EB] dark:text-[#60A5FA]">{formatMoney(loan.ledger?.outstanding)}</span>
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold bg-[#FFE600] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0_0_#000] uppercase shrink-0 self-start sm:self-auto">
                      {daysUntil(loan.due_date) === 0 ? "DUE TODAY" : `DUE IN ${daysUntil(loan.due_date)}D`}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </RetroWindow>
        </div>
      )}

      {/* Loan Summary Section */}
      {hasCompletedDeals && (
        <div className="w-full min-w-0">
          <RetroWindow
            title={<><span>LEDGER TOTALS</span><span className="hidden sm:inline"> // LIFETIME SUMMARY</span></>}
            subtitle="aggregate view"
            colorBar="blue"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] w-full"
            contentClassName="p-3.5 sm:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 font-mono w-full">
              <div className="p-3 sm:p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
                <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 dark:text-gray-200">Total Lifetime Lent</p>
                <p className="mt-0.5 text-2xl sm:text-3xl font-black text-[#059669] dark:text-[#2DD4BF]">
                  {formatMoney(aggregates.totalLent)}
                </p>
              </div>
              <div className="p-3 sm:p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
                <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 dark:text-gray-200">Total Lifetime Borrowed</p>
                <p className="mt-0.5 text-2xl sm:text-3xl font-black text-[#F43F5E]">
                  {formatMoney(aggregates.totalBorrowed)}
                </p>
              </div>
            </div>
          </RetroWindow>
        </div>
      )}

      {/* Open Requests Section */}
      <motion.section
        className="flex flex-col gap-2 w-full min-w-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-teal-600 dark:text-teal-400">[ACTIVE PROPOSALS]</span>
            <span className="text-gray-400 font-mono text-xs">//</span>
            <h2 className="font-mono text-base sm:text-lg font-black text-black dark:text-white uppercase tracking-tight truncate">
              Open Requests
            </h2>
          </div>
          <LinkButton href="/requests/new" size="sm">
            <span className="font-bold text-xs sm:text-sm">+ NEW REQUEST</span>
          </LinkButton>
        </div>

        {openRequests.length === 0 ? (
          <div className="border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] p-3.5 sm:p-4 text-center shadow-[2.5px_2.5px_0_0_#000] w-full">
            <p className="font-mono text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
              No open requests. Start a new peer deal with the button above.
            </p>
          </div>
        ) : (
          <motion.div className="flex flex-col gap-2 w-full min-w-0" variants={containerVariants} initial="hidden" animate="visible">
            {openRequests.slice(0, 5).map((r: any) => {
              const other = r.sender.id === userId ? r.receiver : r.sender;
              return (
                <motion.div
                  key={r.id}
                  className="w-full min-w-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                >
                  <a
                    href={`/requests/${r.id}`}
                    className="flex items-center justify-between gap-2 p-3 sm:p-4 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] shadow-[2.5px_2.5px_0_0_#000] hover:bg-[#FEF08A] hover:text-black dark:hover:bg-[#1E212D] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all font-mono w-full"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm sm:text-base font-black truncate">
                        {other.full_name ?? ("@" + other.username)} ·{" "}
                        {r.active_offer ? formatMoney(r.active_offer.amount) : "—"}
                      </p>
                      <p className="font-mono text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 font-bold mt-0.5 truncate">
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

      {/* Personal Tracker (Self Track) Overview Section - Tighter, space-optimized */}
      {!hideSelfTrack && (
      <motion.section
        className="flex flex-col gap-2 w-full min-w-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-full min-w-0">
          <RetroWindow
            title="PERSONAL TRACKER // OFFLINE LEDGER"
              onClose={() => setHideSelfTrack(true)}
              onMaximize={() => router.push("/self-track")}
            subtitle="self track summary"
            colorBar="yellow"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] w-full"
            contentClassName="p-3 sm:p-4"
            headerRight={
              <a
                href="/self-track"
                className="px-2.5 py-1 border border-black bg-[#FFE600] text-black font-mono text-[11px] sm:text-xs font-black shadow-[1.5px_1.5px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#000] transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>MANAGE</span>
                <span>→</span>
              </a>
            }
          >
            <div className="flex flex-col gap-2.5 font-mono w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/10 dark:border-white/10 pb-2">
                <div className="min-w-0">
                  <h3 className="font-mono text-sm sm:text-base font-black text-black dark:text-white uppercase truncate">
                    Private Cash & Offline Records
                  </h3>
                  <p className="font-mono text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 font-semibold truncate">
                    100% private to you · Untracked by other users
                  </p>
                </div>
                <div className="font-mono text-[11px] sm:text-xs font-black text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 border border-purple-400 dark:border-purple-800 self-start sm:self-auto shadow-[1px_1px_0_0_#000] shrink-0">
                  {selfTracks.length} TOTAL RECORD{selfTracks.length !== 1 ? "S" : ""}
                </div>
              </div>

              {/* Borrowed vs Lent Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full min-w-0">
                {/* Personal Lent */}
                <div className="p-3 sm:p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000] min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] sm:text-xs font-black text-[#059669] dark:text-[#2DD4BF] uppercase truncate">
                      Money You Lent (Offline)
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 border border-emerald-400 font-bold shrink-0">
                      {selfTracks.filter((r) => r.type === "lent" && r.status === "active").length} ACTIVE
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-black text-[#059669] dark:text-[#2DD4BF] mt-0.5">
                    {formatMoney(personalLentActive)}
                  </p>
                  <p className="font-mono text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                    Outstanding to collect from friends
                  </p>
                </div>

                {/* Personal Borrowed */}
                <div className="p-3 sm:p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000] min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] sm:text-xs font-black text-[#F43F5E] uppercase truncate">
                      Money You Borrowed (Offline)
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-1.5 py-0.2 border border-rose-400 font-bold shrink-0">
                      {selfTracks.filter((r) => r.type === "borrowed" && r.status === "active").length} ACTIVE
                    </span>
                  </div>
                  <p className="font-mono text-2xl sm:text-3xl font-black text-[#F43F5E] mt-0.5">
                    {formatMoney(personalBorrowedActive)}
                  </p>
                  <p className="font-mono text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                    Remaining debt for you to repay
                  </p>
                </div>
              </div>

              {/* Recent Personal Track Entries Snippet */}
              {selfTracks.length > 0 && (
                <div className="space-y-1.5 pt-0.5 w-full min-w-0">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                    <span className="uppercase tracking-wider truncate">RECENT OFFLINE ENTRIES ({selfTracks.length})</span>
                    <a href="/self-track" className="text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline flex items-center gap-1 shrink-0">
                      Manage & Record New →
                    </a>
                  </div>
                  <div className="grid gap-1.5 w-full min-w-0">
                    {selfTracks.slice(0, 4).map((r) => {
                      const isLent = r.type === "lent";
                      const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                      const remaining = Math.max(0, Number(r.amount) - paid);
                      const isSettled = r.status === "settled" || remaining === 0;
                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-2 p-2.5 sm:p-3 border-[1.5px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] text-xs sm:text-sm font-mono shadow-[1.5px_1.5px_0_0_#000] w-full min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 truncate">
                            <span
                              className={`px-1.5 py-0.2 border border-black text-[9px] sm:text-[10px] font-bold uppercase shrink-0 ${
                                isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                              }`}
                            >
                              {isLent ? "LENT" : "BORROWED"}
                            </span>
                            <span className="font-bold text-black dark:text-white text-xs sm:text-sm truncate">
                              {r.person_name}
                            </span>
                            {r.note && (
                              <span className="hidden sm:inline text-xs text-gray-500 italic truncate max-w-[180px]">
                                ({r.note})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-black text-xs sm:text-sm ${isLent ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"}`}>
                              {formatMoney(remaining > 0 ? remaining : Number(r.amount))}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 border border-black uppercase ${
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
                <div className="p-2.5 border border-dashed border-black/30 dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] text-center font-mono text-xs font-bold text-gray-600 dark:text-gray-300 w-full">
                  No offline cash tracks recorded yet. Keep private notes on informal debts anytime.
                </div>
              )}
            </div>
          </RetroWindow>
        </div>
      </motion.section>
      )}
    </motion.div>
  );
}
