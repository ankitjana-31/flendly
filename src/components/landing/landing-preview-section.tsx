"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Bell, Wallet, Zap, Sparkles } from "lucide-react";

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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md hover:border-teal-400/50 hover:bg-teal-500/10 hover:text-teal-300 transition-all duration-300 cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          Interactive Product Showcase
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight">
          Everything you need in one sleek hub
        </h2>
        <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
          Explore how Flendly organizes every loan, request, reminder, and private cash record.
        </p>
      </div>

      {/* Interactive Tabs Selector with Smooth Hover Effects */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/20 scale-105"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-teal-500/40 hover:shadow-[0_0_15px_rgba(45,212,191,0.15)] hover:-translate-y-0.5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              <span className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${
                isActive ? "bg-teal-400/20 text-teal-300 font-bold" : "bg-slate-800 text-slate-400"
              }`}>
                {tab.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Glass Card with Hover Border Glow */}
      <div className="relative rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-300 hover:border-teal-500/30">
        {/* Top Browser/App Bar Simulation */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">app.flendly.io/{activeTab}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync Active
          </div>
        </div>

        {/* Tab 1: Dashboard View */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Stats Grid with Glassy Hover Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                <span className="text-xs text-slate-400 font-medium">Net Position</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-emerald-400 mt-1">+₹14,500</p>
                <span className="text-[11px] text-emerald-400/80 mt-1 block">You are owed more than you owe</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Lent Out</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-blue-400 mt-1">₹22,000</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Across 3 active peer deals</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Borrowed</span>
                <p className="text-2xl sm:text-3xl font-bold font-tabular text-rose-400 mt-1">₹7,500</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Next payment due in 12 days</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-3 transition-all duration-300 hover:border-slate-600">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <span className="text-xs text-teal-400 font-semibold">Auto-verified</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 transition-all duration-200 hover:bg-slate-900/90 hover:border-slate-700 hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">IN</div>
                      <div>
                        <p className="text-sm font-semibold text-white">Rohit repaid installment</p>
                        <p className="text-xs text-slate-400">Via UPI · 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+₹3,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 transition-all duration-200 hover:bg-slate-900/90 hover:border-slate-700 hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">OUT</div>
                      <div>
                        <p className="text-sm font-semibold text-white">Loan disbursed to Shreya</p>
                        <p className="text-xs text-slate-400">Fixed terms · Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-400">₹8,000</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex flex-col justify-between transition-all duration-300 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold mb-3">
                    <Zap className="w-3.5 h-3.5" /> Instant Counter-Offer
                  </div>
                  <h4 className="text-base font-bold text-white">Smart Loan Negotiations</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Review terms, propose split deadlines, or suggest custom interest with single-click proposals.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-teal-500/20 flex items-center justify-between text-xs text-teal-300 font-semibold">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white">Money You Lent Out</h3>
              <span className="text-xs font-semibold text-teal-400">3 active borrowers</span>
            </div>
            {[
              { name: "Aarav Sharma", amount: "₹12,000", repaid: "₹8,000", remaining: "₹4,000", progress: 66, status: "On Track" },
              { name: "Priya Nair", amount: "₹15,000", repaid: "₹5,000", remaining: "₹10,000", progress: 33, status: "Due 15 Oct" },
              { name: "Vikram Mehta", amount: "₹5,000", repaid: "₹5,000", remaining: "₹0", progress: 100, status: "Settled" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-teal-500/30 hover:scale-[1.005]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{deal.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      deal.progress === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Total: {deal.amount} · Repaid: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block text-right">{deal.progress}% returned</span>
                  </div>
                  <span className="text-sm font-bold font-tabular text-emerald-400">{deal.remaining} left</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Borrowed View */}
        {activeTab === "borrowed" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white">Money You Borrowed</h3>
              <span className="text-xs font-semibold text-rose-400">Clear repayment paths</span>
            </div>
            {[
              { name: "Devansh Roy", amount: "₹10,000", repaid: "₹6,000", remaining: "₹4,000", progress: 60, nextDue: "Due in 8 days" },
              { name: "Neha Gupta", amount: "₹4,000", repaid: "₹2,000", remaining: "₹2,000", progress: 50, nextDue: "Due in 20 days" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:bg-slate-800/60 hover:border-rose-500/30 hover:scale-[1.005]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{deal.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-300">
                      {deal.nextDue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Initial loan: {deal.amount} · Paid so far: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block text-right">{deal.progress}% settled</span>
                  </div>
                  <span className="text-sm font-bold font-tabular text-rose-400">{deal.remaining} due</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 4: Notifications View */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white">Live Deal Alerts & Approvals</h3>
              <span className="text-xs font-semibold text-blue-400">Zero spam</span>
            </div>
            {[
              { title: "Payment Recorded", desc: "Aarav recorded ₹2,000 repayment. Please review and confirm.", time: "10 mins ago", unread: true },
              { title: "Counter-Offer Received", desc: "Priya modified repayment schedule to monthly ₹3,000.", time: "2 hours ago", unread: false },
              { title: "Friendly Reminder", desc: "Repayment of ₹4,000 to Devansh scheduled for Friday.", time: "Yesterday", unread: false },
            ].map((notif, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${
                notif.unread ? "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15" : "bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40"
              } flex items-start justify-between gap-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.unread ? "bg-blue-400" : "bg-slate-600"}`} />
                  <div>
                    <h5 className="text-sm font-bold text-white">{notif.title}</h5>
                    <p className="text-xs text-slate-300 mt-0.5">{notif.desc}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{notif.time}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 5: Self Track View */}
        {activeTab === "selftrack" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-base font-bold text-white">Self Track: Private Offline Ledger</h3>
                <p className="text-xs text-purple-300">100% private to you · Never notifies anyone</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold">Standalone</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/40 hover:-translate-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-teal-400">Lent Offline</span>
                  <span className="text-xs font-bold font-tabular text-white">₹3,500</span>
                </div>
                <h5 className="font-bold text-sm text-white">Kunal (Concert Tickets)</h5>
                <p className="text-xs text-slate-400">Note: Told me he will pay via GPay next weekend</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-teal-300">₹1,500 repaid</span>
                  <span className="text-slate-400">₹2,000 remaining</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/40 hover:-translate-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-rose-400">Borrowed Offline</span>
                  <span className="text-xs font-bold font-tabular text-white">₹1,200</span>
                </div>
                <h5 className="font-bold text-sm text-white">Roommate (Wifi bill)</h5>
                <p className="text-xs text-slate-400">Note: Pay cash before 1st of month</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-rose-300">Active</span>
                  <span className="text-slate-400">₹1,200 remaining</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
