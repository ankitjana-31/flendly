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
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Retro Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 border-b border-[#1E2935] pb-5"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-teal-400 font-semibold">[SYS.SESSION_ACTIVE]</span>
          <span className="text-slate-500 font-mono text-xs">//</span>
          <span className="font-mono text-xs text-slate-400">FLENDLY.OS MASTER DASHBOARD</span>
        </div>
        <h1 className="font-mono text-2xl font-bold sm:text-3xl tracking-tight text-white mt-1">
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
          <h2 className="font-heading text-lg font-semibold">Open requests</h2>
          <LinkButton href="/requests/new" size="sm">
            New request
          </LinkButton>
        </div>

        {openRequests.length === 0 ? (
          <GlareHover>
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No open requests. Start one with the button above.
            </Card>
          </GlareHover>
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
                  <GlareHover>
                    <motion.a href={`/requests/${r.id}`} whileHover={{ scale: 1.01 }}>
                      <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted">
                        <div>
                          <p className="text-sm font-medium">
                            {other.full_name ?? `@${other.username}`} ·{" "}
                            {r.active_offer ? formatMoney(r.active_offer.amount) : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.sender.id === userId ? "You sent" : "Sent to you"} ·{" "}
                            {r.direction === "lend" ? "you lend" : "you borrow"}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </Card>
                    </motion.a>
                  </GlareHover>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.section>

      {/* Self Track Section */}
      <motion.section
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Personal Tracking</h2>
          <div className="text-xs text-muted-foreground">
            {selfTracks.length > 0 && `${selfTracks.length} record${selfTracks.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        <SelfTrackForm onSuccess={handleSelfTrackRefresh} />

        {selfTracks.length > 0 && (
          <SelfTrackList records={selfTracks} onRecordDeleted={handleSelfTrackRefresh} />
        )}
      </motion.section>
    </motion.div>
  );
}
