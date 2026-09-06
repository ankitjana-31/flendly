"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Bell, Wallet, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function LandingPreviewSection() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "lent" | "borrowed" | "notifications" | "selftrack">("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, tag: "Command Center" },
    { id: "lent", label: "Lent", icon: ArrowUpRight, tag: "Money Given" },
    { id: "borrowed", label: "Borrowed", icon: ArrowDownLeft, tag: "Money Taken" },
    { id: "notifications", label: "Notifications", icon: Bell, tag: "Live Approvals" },
    { id: "selftrack", label: "Self Track", icon: Wallet, tag: "Private Ledger" },
  ] as const;

  return (
    <section className="relative z-20 w-full max-w-6xl mx-auto mt-24 px-4 sm:px-6 pb-20">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
          Interactive Product Showcase
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Everything you need in one sleek hub
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
          Explore how Flendly organizes every loan, request, reminder, and private cash record.
        </p>
      </div>

      {/* Interactive Tabs Selector */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-teal-500/15 border-teal-500 text-zinc-900 dark:text-white shadow-lg shadow-teal-500/10 scale-105"
                  : "bg-white/80 dark:bg-slate-900/60 border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60 hover:border-zinc-300 dark:hover:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-zinc-400 dark:text-slate-400"}`} />
              <span>{tab.label}</span>
              <span className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold" : "bg-zinc-100 dark:bg-slate-800 text-zinc-500 dark:text-slate-400"
              }`}>
                {tab.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Glass Card */}
      <div className="relative rounded-3xl border border-zinc-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Top Browser/App Bar Simulation */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-slate-800/80 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-zinc-500 dark:text-slate-400 hidden sm:inline">app.flendly.io/{activeTab}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </div>
        </div>

        {/* Tab 1: Dashboard View */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-slate-800/40 border border-zinc-200/70 dark:border-slate-700/50 shadow-sm">
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">Net Position</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-emerald-600 dark:text-emerald-400 mt-1">+₹14,500</p>
                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">You are owed more than you owe</span>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-slate-800/40 border border-zinc-200/70 dark:border-slate-700/50 shadow-sm">
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">Total Lent Out</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-blue-600 dark:text-blue-400 mt-1">₹22,000</p>
                <span className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1 block">Across 3 active peer deals</span>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-slate-800/40 border border-zinc-200/70 dark:border-slate-700/50 shadow-sm">
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">Total Borrowed</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-rose-600 dark:text-rose-400 mt-1">₹7,500</p>
                <span className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1 block">Next payment due in 12 days</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-slate-800/30 border border-zinc-200/70 dark:border-slate-700/40 space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Auto-verified</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">IN</div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Rohit repaid installment</p>
                        <p className="text-xs text-zinc-500 dark:text-slate-400">Via UPI · 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₹3,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">OUT</div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Loan disbursed to Shreya</p>
                        <p className="text-xs text-zinc-500 dark:text-slate-400">Fixed terms · Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹8,000</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold mb-3">
                    <Zap className="w-3.5 h-3.5" /> Instant Counter-Offer
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">Smart Loan Negotiations</h4>
                  <p className="text-xs text-zinc-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Review terms, propose split deadlines, or suggest custom interest with single-click proposals.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-700 dark:text-teal-300 font-semibold">
                  <span>Negotiation engine active</span>
                  <span>0% friction</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Lent View */}
        {activeTab === "lent" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Money You Lent Out</h3>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">3 active borrowers</span>
            </div>
            {[
              { name: "Aarav Sharma", amount: "₹12,000", repaid: "₹8,000", remaining: "₹4,000", progress: 66, status: "On Track" },
              { name: "Priya Nair", amount: "₹15,000", repaid: "₹5,000", remaining: "₹10,000", progress: 33, status: "Due 15 Oct" },
              { name: "Vikram Mehta", amount: "₹5,000", repaid: "₹5,000", remaining: "₹0", progress: 100, status: "Settled" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/30 border border-zinc-200/70 dark:border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{deal.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      deal.progress === 100 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/20 text-blue-600 dark:text-blue-300"
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">Total: {deal.amount} · Repaid: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <div className="w-full bg-zinc-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-slate-400 mt-1 block text-right">{deal.progress}% returned</span>
                  </div>
                  <span className="text-sm font-bold font-tabular text-emerald-600 dark:text-emerald-400">{deal.remaining} left</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Borrowed View */}
        {activeTab === "borrowed" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Money You Borrowed</h3>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Clear repayment paths</span>
            </div>
            {[
              { name: "Devansh Roy", amount: "₹10,000", repaid: "₹6,000", remaining: "₹4,000", progress: 60, nextDue: "Due in 8 days" },
              { name: "Neha Gupta", amount: "₹4,000", repaid: "₹2,000", remaining: "₹2,000", progress: 50, nextDue: "Due in 20 days" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 rounded-2xl bg-zinc-50 dark:bg-slate-800/30 border border-zinc-200/70 dark:border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{deal.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-300">
                      {deal.nextDue}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1">Initial loan: {deal.amount} · Paid so far: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <div className="w-full bg-zinc-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-slate-400 mt-1 block text-right">{deal.progress}% settled</span>
                  </div>
                  <span className="text-sm font-bold font-tabular text-rose-600 dark:text-rose-400">{deal.remaining} due</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 4: Notifications View */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Live Deal Alerts & Approvals</h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Zero spam</span>
            </div>
            {[
              { title: "Payment Recorded", desc: "Aarav recorded ₹2,000 repayment. Please review and confirm.", time: "10 mins ago", unread: true },
              { title: "Counter-Offer Received", desc: "Priya modified repayment schedule to monthly ₹3,000.", time: "2 hours ago", unread: false },
              { title: "Friendly Reminder", desc: "Repayment of ₹4,000 to Devansh scheduled for Friday.", time: "Yesterday", unread: false },
            ].map((notif, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border transition-colors ${
                notif.unread ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-50 dark:bg-slate-800/20 border-zinc-200/70 dark:border-slate-700/30"
              } flex items-start justify-between gap-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.unread ? "bg-blue-500" : "bg-zinc-400 dark:bg-slate-600"}`} />
                  <div>
                    <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{notif.title}</h5>
                    <p className="text-xs text-zinc-600 dark:text-slate-300 mt-0.5">{notif.desc}</p>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-slate-400 shrink-0">{notif.time}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 5: Self Track View */}
        {activeTab === "selftrack" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Self Track: Private Offline Ledger</h3>
                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">100% private to you · Never notifies anyone</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold">Standalone</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Lent Offline</span>
                  <span className="text-xs font-bold font-tabular text-zinc-900 dark:text-white">₹3,500</span>
                </div>
                <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Kunal (Concert Tickets)</h5>
                <p className="text-xs text-zinc-500 dark:text-slate-400">Note: Told me he will pay via GPay next weekend</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-teal-700 dark:text-teal-300 font-medium">₹1,500 repaid</span>
                  <span className="text-zinc-500 dark:text-slate-400">₹2,000 remaining</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Borrowed Offline</span>
                  <span className="text-xs font-bold font-tabular text-zinc-900 dark:text-white">₹1,200</span>
                </div>
                <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Roommate (Wifi bill)</h5>
                <p className="text-xs text-zinc-500 dark:text-slate-400">Note: Pay cash before 1st of month</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-rose-600 dark:text-rose-300 font-medium">Active</span>
                  <span className="text-zinc-500 dark:text-slate-400">₹1,200 remaining</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
