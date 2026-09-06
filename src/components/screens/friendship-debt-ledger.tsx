"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function FriendshipDebtLedger() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const transactions = [
    {
      id: "txn-001",
      type: "loan",
      counterparty: "Sarah Chen",
      amount: 500,
      date: "2026-08-15",
      status: "active",
      daysElapsed: 22,
      interest: 3.5,
      principal: 500,
      interestAccrued: 1.2,
      notes: "Dinner & flight for Vegas trip",
    },
    {
      id: "txn-002",
      type: "payment",
      counterparty: "Mike Johnson",
      amount: 150,
      date: "2026-08-28",
      status: "settled",
      daysElapsed: 9,
      notes: "Payment received",
    },
    {
      id: "txn-003",
      type: "loan",
      counterparty: "Alex Rivera",
      amount: 250,
      date: "2026-07-20",
      status: "overdue",
      daysElapsed: 48,
      daysOverdue: 3,
      interest: 2.5,
      principal: 250,
      interestAccrued: 1.8,
      notes: "Emergency car repair",
    },
    {
      id: "txn-004",
      type: "payment",
      counterparty: "Jordan Lee",
      amount: 75,
      date: "2026-08-10",
      status: "settled",
      daysElapsed: 27,
      notes: "Partial payment",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stats = {
    activeLoans: transactions.filter((t) => t.type === "loan" && t.status === "active").length,
    settledTransactions: transactions.filter((t) => t.status === "settled").length,
    overdueCount: transactions.filter((t) => t.status === "overdue").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-500/5 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Friendship Debt Ledger
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete transaction history with your friends
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            label="Active Loans"
            value={stats.activeLoans}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            label="Settled"
            value={stats.settledTransactions}
            icon={CheckCircle}
            color="blue"
          />
          <StatCard
            label="Overdue"
            value={stats.overdueCount}
            icon={AlertCircle}
            color="rose"
          />
        </motion.div>

        {/* Ledger Timeline */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-card/60 p-8 backdrop-blur-xl"
        >
          <h3 className="font-heading text-2xl font-bold mb-8">All Transactions</h3>

          <div className="space-y-3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {transactions.map((txn, index) => (
                <motion.div
                  key={txn.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  onClick={() =>
                    setExpandedId(expandedId === txn.id ? null : txn.id)
                  }
                  className="cursor-pointer"
                >
                  <div className="rounded-2xl border border-border/40 bg-background/30 hover:bg-background/50 p-4 transition-all">
                    <div className="flex items-center justify-between">
                      {/* Left: Type & Counterparty */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`p-3 rounded-lg shrink-0 ${
                            txn.type === "loan"
                              ? "bg-emerald-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {txn.type === "loan" ? (
                            <TrendingUp
                              className={`w-5 h-5 ${
                                txn.type === "loan"
                                  ? "text-emerald-600"
                                  : "text-blue-600"
                              }`}
                            />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">
                            {txn.counterparty}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {txn.notes}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Date & Duration */}
                      <div className="text-right mx-4 hidden sm:block">
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm font-medium">
                          {txn.daysElapsed}d
                          {txn.daysOverdue && (
                            <span className="text-rose-600 ml-1">
                              ({txn.daysOverdue}d overdue)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Right: Amount & Status */}
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            txn.type === "loan"
                              ? "text-emerald-600"
                              : "text-green-600"
                          }`}
                        >
                          {txn.type === "loan" ? "+" : "-"}${txn.amount}
                        </p>
                        <div className="flex justify-end mt-1">
                          <StatusBadge status={txn.status} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === txn.id && txn.type === "loan" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border/30 space-y-3"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <DetailItem
                            label="Principal"
                            value={`$${txn.principal}`}
                          />
                          <DetailItem
                            label="Interest Rate"
                            value={`${txn.interest}%`}
                          />
                          <DetailItem
                            label="Accrued Interest"
                            value={`$${txn.interestAccrued}`}
                          />
                          <DetailItem
                            label="Days Elapsed"
                            value={`${txn.daysElapsed}d`}
                          />
                        </div>

                        <div className="pt-3 border-t border-border/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Interest Accrual
                            </span>
                            <span className="text-sm font-semibold text-emerald-600">
                              ${(txn.interestAccrued ?? 0).toFixed(2)} / month
                            </span>
                          </div>
                          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${((txn.interestAccrued ?? 0) / (txn.principal ?? 1)) * 100}%`,
                              }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                            />
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full mt-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
                        >
                          View Full Ledger
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Summary Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Lent
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">$750</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Borrowed
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">$225</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Interest Earned
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">$3.00</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Friends Involved
              </p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">4</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/20 text-emerald-600",
    blue: "from-blue-500/20 to-blue-600/20 text-blue-600",
    rose: "from-rose-500/20 to-rose-600/20 text-rose-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border border-border/60 bg-gradient-to-br ${colorMap[color]} p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-current/10 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { bg: string; text: string; label: string }> =
    {
      active: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-400",
        label: "Active",
      },
      settled: {
        bg: "bg-blue-500/10",
        text: "text-blue-700 dark:text-blue-400",
        label: "Settled",
      },
      overdue: {
        bg: "bg-rose-500/10",
        text: "text-rose-700 dark:text-rose-400",
        label: "Overdue",
      },
    };

  const s = statusMap[status] || statusMap.active;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}
