"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";

export function FinancialHorizonScreen() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Financial Horizon
          </h1>
          <p className="text-muted-foreground mt-2">
            Your peer-to-peer lending overview at a glance
          </p>
        </motion.div>

        {/* Net Equity Hero Card */}
        <motion.div
          variants={itemVariants}
          className="mb-8 relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-card/60 p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              Net Friend Equity
            </p>
            <div className="mt-6 flex items-end gap-4">
              <div className="flex-1">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent"
                >
                  +$1,830
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2">
                  You're ahead across all friends
                </p>
              </div>

              {/* Animated Donut Chart Placeholder */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-emerald-500/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="188 251"
                    className="text-emerald-500"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* You're Owed Card */}
          <KPICard
            icon={TrendingUp}
            title="You're Owed"
            amount="$2,450"
            subtitle="across 5 active loans"
            color="emerald"
            trend="+12%"
          />

          {/* You Owe Card */}
          <KPICard
            icon={TrendingDown}
            title="You Owe"
            amount="$620"
            subtitle="across 2 active loans"
            color="rose"
            trend="-8%"
          />

          {/* Due Soon Card */}
          <KPICard
            icon={Clock}
            title="Due Soon"
            amount="$340"
            subtitle="in the next 7 days"
            color="amber"
            trend="2 payments"
          />
        </motion.div>

        {/* Status Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Section */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-danger/40 bg-danger/5 p-6"
          >
            <h3 className="font-heading text-lg font-semibold text-danger mb-4">
              🚨 Overdue Payments
            </h3>
            <div className="space-y-3">
              <StatusItem
                name="Sarah Chen"
                amount="$250"
                daysOverdue={3}
                status="overdue"
              />
            </div>
          </motion.div>

          {/* Upcoming Section */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-warning/40 bg-warning/5 p-6"
          >
            <h3 className="font-heading text-lg font-semibold text-warning mb-4">
              ⏰ Due Soon
            </h3>
            <div className="space-y-3">
              <StatusItem
                name="Mike Johnson"
                amount="$150"
                daysUntil={2}
                status="upcoming"
              />
              <StatusItem
                name="Alex Rivera"
                amount="$190"
                daysUntil={5}
                status="upcoming"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  title,
  amount,
  subtitle,
  color,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  amount: string;
  subtitle: string;
  color: "emerald" | "rose" | "amber";
  trend: string;
}) {
  const colorMap = {
    emerald: "from-emerald-500/20 to-emerald-600/20 text-emerald-600",
    rose: "from-rose-500/20 to-rose-600/20 text-rose-600",
    amber: "from-amber-500/20 to-amber-600/20 text-amber-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
      className={`rounded-2xl border border-border/60 bg-gradient-to-br ${colorMap[color]} p-6 backdrop-blur-sm cursor-default`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color]} bg-opacity-20`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {trend}
        </span>
      </div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2">{amount}</p>
      <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
    </motion.div>
  );
}

function StatusItem({
  name,
  amount,
  daysOverdue,
  daysUntil,
  status,
}: {
  name: string;
  amount: string;
  daysOverdue?: number;
  daysUntil?: number;
  status: "overdue" | "upcoming";
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/30">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {status === "overdue"
            ? `${daysOverdue} days overdue`
            : `Due in ${daysUntil} days`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm">{amount}</p>
        <CheckCircle className="w-4 h-4 mt-1 text-muted-foreground" />
      </div>
    </div>
  );
}
