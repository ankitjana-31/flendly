"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LinkButton, Card } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatMoney, formatDate, daysUntil } from "@/lib/format";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { SelfTrackForm } from "@/components/self-track/self-track-form";
import { SelfTrackList } from "@/components/self-track/self-track-list";
import { clientListSelfTracks } from "@/lib/self-track/client";
import { GlareHover } from "@/components/ui/glare-hover";
import { RetroWindow } from "@/components/ui/retro-window";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
  const [selfTracks, setSelfTracks] = useState(initialSelfTracks);

  const handleSelfTrackRefresh = async () => {
    try {
      const updated = await clientListSelfTracks(userId);
      setSelfTracks(updated);
    } catch (error) {
      console.error("Failed to refresh self tracks:", error);
    }
  };

  return (
    <motion.div
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 md:py-6 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Retro Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 border-b border-black/10 dark:border-[#1E2935] pb-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold">[SYS.SESSION_ACTIVE]</span>
          <span className="text-gray-400 font-mono text-xs">//</span>
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">FLENDLY.OS MASTER DASHBOARD</span>
        </div>
        <h1 className="font-mono text-2xl font-bold sm:text-3xl tracking-tight text-black dark:text-white mt-0.5">
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
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <RetroWindow
            title="RECEIVABLES.sys // INCOMING"
            subtitle="owed_to_you"
            colorBar="green"
            glow={aggregates.totalLent > 0}
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#059669]"
            contentClassName="p-5 sm:p-6"
            headerRight={
              <span className="px-2 py-0.5 border border-black bg-white text-black font-mono text-[10px] font-bold">
                +INCOMING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">You&apos;re owed</p>
              <motion.p
                className="mt-2 font-mono text-3xl sm:text-4xl font-black text-[#059669] dark:text-[#2DD4BF] tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              >
                {formatMoney(aggregates.totalLent)}
              </motion.p>
              <p className="mt-2 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                across {aggregates.activeLentCount} active loan{aggregates.activeLentCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <RetroWindow
            title="PAYABLES.sys // OUTGOING"
            subtitle="you_owe"
            colorBar="pink"
            className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000] dark:shadow-[5px_5px_0_0_#F43F5E]"
            contentClassName="p-5 sm:p-6"
            headerRight={
              <span className="px-2 py-0.5 border border-black bg-white text-black font-mono text-[10px] font-bold">
                -OUTGOING
              </span>
            }
          >
            <div>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">You owe</p>
              <motion.p
                className="mt-2 font-mono text-3xl sm:text-4xl font-black text-[#F43F5E] tracking-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              >
                {formatMoney(aggregates.totalBorrowed)}
              </motion.p>
              <p className="mt-2 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                across {aggregates.activeBorrowedCount} active loan{aggregates.activeBorrowedCount === 1 ? "" : "s"}
              </p>
            </div>
          </RetroWindow>
        </motion.div>
      </motion.div>

      {/* Overdue Section - Conditional */}
      {hasCompletedDeals && aggregates.overdue.length > 0 && (
        <AnimatedContainer animation="fadeInUp">
          <GlareHover>
            <Card className="border-danger/40 bg-danger/5 p-5">
              <h2 className="font-heading text-sm font-semibold text-danger">Overdue</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {aggregates.overdue.map((loan: any, idx: number) => (
                  <motion.li
                    key={loan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <a href={`/loans/${loan.id}`} className="flex items-center justify-between text-sm hover:underline">
                      <span>
                        {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                        {formatMoney(loan.ledger?.outstanding)}
                      </span>
                      <span className="text-muted-foreground">due {formatDate(loan.due_date)}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </GlareHover>
        </AnimatedContainer>
      )}

      {/* Due Soon Section - Conditional */}
      {hasCompletedDeals && aggregates.upcoming.length > 0 && (
        <AnimatedContainer animation="fadeInUp">
          <GlareHover>
            <Card className="border-warning/40 bg-warning/5 p-5">
              <h2 className="font-heading text-sm font-semibold text-warning">Due soon</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {aggregates.upcoming.map((loan: any, idx: number) => (
                  <motion.li
                    key={loan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <a href={`/loans/${loan.id}`} className="flex items-center justify-between text-sm hover:underline">
                      <span>
                        {loan.counterparty.full_name ?? `@${loan.counterparty.username}`} ·{" "}
                        {formatMoney(loan.ledger?.outstanding)}
                      </span>
                      <span className="text-muted-foreground">
                        {daysUntil(loan.due_date) === 0 ? "due today" : `due in ${daysUntil(loan.due_date)}d`}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </GlareHover>
        </AnimatedContainer>
      )}

      {/* Analysis Section - Only shows if user has completed deals */}
      {hasCompletedDeals && (
        <AnimatedContainer animation="fadeInUp">
          <GlareHover>
            <Card className="p-5 border-primary/20 bg-primary/5">
              <h2 className="font-heading text-sm font-semibold">Loan Summary</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Lent</p>
                  <p className="mt-1 font-tabular text-lg font-bold text-success">
                    {formatMoney(aggregates.totalLent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Borrowed</p>
                  <p className="mt-1 font-tabular text-lg font-bold text-danger">
                    {formatMoney(aggregates.totalBorrowed)}
                  </p>
                </div>
              </div>
            </Card>
          </GlareHover>
        </AnimatedContainer>
      )}

      {/* Open Requests Section */}
      <motion.section
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">[REQUESTS.sys]</span>
            <h2 className="font-mono text-base font-bold text-black dark:text-white uppercase tracking-tight">Open Requests</h2>
          </div>
          <LinkButton href="/requests/new" size="sm" className="bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs font-bold shadow-[2px_2px_0_0_#000] hover:bg-yellow-300">
            + New request
          </LinkButton>
        </div>

        {openRequests.length === 0 ? (
          <div className="border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] p-6 text-center shadow-[3px_3px_0_0_#000]">
            <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
              No open requests. Start a new peer deal with the button above.
            </p>
          </div>
        ) : (
          <motion.div className="flex flex-col gap-2" variants={containerVariants} initial="hidden" animate="visible">
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
                    className="flex items-center justify-between p-4 border-[2px] border-black dark:border-white/40 bg-white dark:bg-[#161821] shadow-[3px_3px_0_0_#000] hover:bg-[#FEF08A] hover:text-black dark:hover:bg-[#1E212D] transition-all"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold">
                        {other.full_name ?? `@${other.username}`} ·{" "}
                        {r.active_offer ? formatMoney(r.active_offer.amount) : "—"}
                      </p>
                      <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
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
        transition={{ delay: 0.6 }}
      >
        <RetroWindow
          title="PERSONAL_TRACKER.sys // OFFLINE_LEDGER"
          subtitle="self_track_summary"
          colorBar="yellow"
          className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
          contentClassName="p-5"
          headerRight={
            <a
              href="/self-track"
              className="px-2.5 py-1 border border-black bg-[#FFE600] text-black font-mono text-[11px] font-bold shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 transition-all flex items-center gap-1"
            >
              <span>MANAGE LEDGER</span>
              <span>→</span>
            </a>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-black dark:text-white uppercase">
                  Private Cash & Offline Records
                </h3>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  100% private to you · Untracked by other users
                </p>
              </div>
              <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 border border-purple-300 dark:border-purple-800 self-start sm:self-auto">
                {selfTracks.length} TOTAL RECORD{selfTracks.length !== 1 ? "S" : ""}
              </div>
            </div>

            {/* Borrowed vs Lent Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Personal Lent */}
              <div className="p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-[#059669] dark:text-[#2DD4BF] uppercase">
                    Money You Lent (Offline)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 border border-emerald-300 font-bold">
                    {selfTracks.filter((r) => r.type === "lent" && r.status === "active").length} ACTIVE
                  </span>
                </div>
                <p className="font-mono text-2xl font-black text-[#059669] dark:text-[#2DD4BF]">
                  {formatMoney(
                    selfTracks
                      .filter((r) => r.type === "lent")
                      .reduce((acc, r) => {
                        const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                        return acc + Math.max(0, Number(r.amount) - paid);
                      }, 0)
                  )}
                </p>
                <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Outstanding to collect from friends
                </p>
              </div>

              {/* Personal Borrowed */}
              <div className="p-3.5 border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[2px_2px_0_0_#000]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-[#F43F5E] uppercase">
                    Money You Borrowed (Offline)
                  </span>
                  <span className="font-mono text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 border border-rose-300 font-bold">
                    {selfTracks.filter((r) => r.type === "borrowed" && r.status === "active").length} ACTIVE
                  </span>
                </div>
                <p className="font-mono text-2xl font-black text-[#F43F5E]">
                  {formatMoney(
                    selfTracks
                      .filter((r) => r.type === "borrowed")
                      .reduce((acc, r) => {
                        const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                        return acc + Math.max(0, Number(r.amount) - paid);
                      }, 0)
                  )}
                </p>
                <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Remaining debt for you to repay
                </p>
              </div>
            </div>

            {/* Recent Personal Track Entries Snippet */}
            {selfTracks.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
                  <span>RECENT LOGS</span>
                  <a href="/self-track" className="text-[#2563EB] dark:text-[#60A5FA] hover:underline flex items-center gap-1">
                    View All & Record New →
                  </a>
                </div>
                <div className="grid gap-2">
                  {selfTracks.slice(0, 3).map((r) => {
                    const isLent = r.type === "lent";
                    const paid = (r.payments || []).reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                    const remaining = Math.max(0, Number(r.amount) - paid);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 border border-black/20 dark:border-white/20 bg-[#FAF8F5] dark:bg-[#1E212D] text-xs font-mono"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                              isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                            }`}
                          >
                            {isLent ? "LENT" : "BORROWED"}
                          </span>
                          <span className="font-bold text-black dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
                            {r.person_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${isLent ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"}`}>
                            {formatMoney(remaining > 0 ? remaining : Number(r.amount))}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase">
                            {r.status === "settled" || remaining === 0 ? "SETTLED" : "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selfTracks.length === 0 && (
              <div className="p-4 border border-dashed border-black/30 dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] text-center font-mono text-xs text-gray-500">
                No offline cash tracks recorded yet. Keep private notes on informal debts anytime.
              </div>
            )}
          </div>
        </RetroWindow>
      </motion.section>
    </motion.div>
  );
}
