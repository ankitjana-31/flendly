"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Bell, Wallet, Zap, Sparkles } from "lucide-react";
import { RetroWindow } from "@/components/ui/retro-window";

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
    <section className="relative z-20 w-full max-w-6xl mx-auto mt-2 px-4 sm:px-6 pb-6">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-[#2DD4BF] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000000] font-mono text-xs font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          INTERACTIVE OS SHOWCASE
        </div>
        <h2 className="font-mono text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase">
          Everything in one retro command center
        </h2>
        <p className="mt-1.5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-sans text-sm sm:text-base">
          Explore how Flendly organizes every loan, request, live reminder, and private cash ledger.
        </p>
      </div>

      {/* Interactive Tabs Selector with Stitch Retro OS Styling */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all duration-200 border-[2px] border-black cursor-pointer ${
                isActive
                  ? "bg-[#FFE600] text-black shadow-[3px_3px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[2px_2px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 text-current" />
              <span>{tab.label}</span>
              <span className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 border border-black ${
                isActive ? "bg-black text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}>
                {tab.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Retro Window */}
      <RetroWindow
        title={`FLENDLY // ${activeTab.toUpperCase()}`}
        subtitle="LIVE PREVIEW"
        colorBar="blue"
        glow={true}
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#2563EB]"
        headerClassName="bg-[#2563EB] text-white"
        contentClassName="p-6 sm:p-10"
        headerRight={
          <div className="flex items-center gap-2 text-xs font-mono text-white bg-black/20 px-2 py-0.5 border border-white/30 font-bold">
            <span className="flex h-2 w-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="hidden sm:inline">LIVE SYNC READY</span>
          </div>
        }
      >

        {/* Tab 1: Dashboard View */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Stats Grid with Stitch Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border-[2px] border-black bg-[#2DD4BF]/15 dark:bg-[#0B3D30] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#005236] dark:text-[#6EE7B7]">Net Position</span>
                <p className="text-2xl sm:text-3xl font-black font-mono text-black dark:text-white mt-1">+₹14,500</p>
                <span className="font-mono text-[11px] text-[#005236] dark:text-[#6EE7B7] mt-1 block font-semibold">You are owed more than you owe</span>
              </div>
              <div className="p-5 border-[2px] border-black bg-blue-500/10 dark:bg-[#1E2540] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#2563EB] dark:text-[#93C5FD]">Total Lent Out</span>
                <p className="text-2xl sm:text-3xl font-black font-mono text-black dark:text-white mt-1">₹22,000</p>
                <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 mt-1 block font-semibold">Across 3 active peer deals</span>
              </div>
              <div className="p-5 border-[2px] border-black bg-[#F43F5E]/10 dark:bg-[#3D0C1D] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#F43F5E] dark:text-[#FDA4AF]">Total Borrowed</span>
                <p className="text-2xl sm:text-3xl font-black font-mono text-black dark:text-white mt-1">₹7,500</p>
                <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 mt-1 block font-semibold">Next payment due in 12 days</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 border-[2px] border-black bg-white dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000000] space-y-3">
                <h4 className="font-mono text-sm font-bold text-black dark:text-white uppercase flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <span className="font-mono text-xs text-[#059669] dark:text-[#2DD4BF] font-bold">Auto-verified</span>
                </h4>
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between p-3 border border-black bg-[#FAF8F5] dark:bg-[#242938]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-black bg-[#2DD4BF] text-black flex items-center justify-center font-bold text-xs">IN</div>
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">Rahul repaid installment</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Via UPI · 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#059669] dark:text-[#2DD4BF]">+₹3,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-black bg-[#FAF8F5] dark:bg-[#242938]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-black bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">OUT</div>
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">Loan disbursed to Supriya</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fixed terms · Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#2563EB] dark:text-[#60A5FA]">₹8,000</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border-[2px] border-black bg-[#FFE600]/20 dark:bg-[#2E2800] shadow-[3px_3px_0_0_#000000] flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-[#FFE600] text-black font-mono text-xs font-bold uppercase mb-3 shadow-[2px_2px_0_0_#000000]">
                    <Zap className="w-3.5 h-3.5" /> Instant Counter-Offer
                  </div>
                  <h4 className="font-mono text-base font-bold text-black dark:text-white uppercase">Smart Loan Negotiations</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                    Review terms, propose split deadlines, or suggest custom interest with single-click proposals.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-black/20 dark:border-white/20 flex items-center justify-between font-mono text-xs text-black dark:text-white font-bold">
                  <span>Negotiation engine active</span>
                  <span className="text-[#059669] dark:text-[#2DD4BF]">0% friction</span>
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
              <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">Money You Lent Out</h3>
              <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#2DD4BF] bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">3 active borrowers</span>
            </div>
            {[
              { name: "Rahul", amount: "₹12,000", repaid: "₹8,000", remaining: "₹4,000", progress: 66, status: "On Track" },
              { name: "Supriya", amount: "₹15,000", repaid: "₹5,000", remaining: "₹10,000", progress: 33, status: "Due 15 Oct" },
              { name: "Junaid", amount: "₹5,000", repaid: "₹5,000", remaining: "₹0", progress: 100, status: "Settled" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black dark:text-white">{deal.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 border border-black font-bold uppercase ${
                      deal.progress === 100 ? "bg-[#2DD4BF] text-black" : "bg-blue-500 text-white"
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total: {deal.amount} · Repaid: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto sm:min-w-[180px]">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                      <div className="bg-[#2DD4BF] h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block text-right font-bold">{deal.progress}% returned</span>
                  </div>
                  <span className="text-sm font-bold text-[#059669] dark:text-[#2DD4BF] shrink-0">{deal.remaining} left</span>
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
              <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">Money You Borrowed</h3>
              <span className="font-mono text-xs font-bold text-[#F43F5E] bg-rose-500/10 px-2 py-0.5 border border-rose-500/30">Clear repayment paths</span>
            </div>
            {[
              { name: "Junaid", amount: "₹10,000", repaid: "₹6,000", remaining: "₹4,000", progress: 60, nextDue: "Due in 8 days" },
              { name: "Supriya", amount: "₹4,000", repaid: "₹2,000", remaining: "₹2,000", progress: 50, nextDue: "Due in 20 days" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black dark:text-white">{deal.name}</span>
                    <span className="text-[10px] px-2 py-0.5 border border-black font-bold uppercase bg-[#F43F5E] text-white">
                      {deal.nextDue}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Initial loan: {deal.amount} · Paid so far: {deal.repaid}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto sm:min-w-[180px]">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                      <div className="bg-[#F43F5E] h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block text-right font-bold">{deal.progress}% settled</span>
                  </div>
                  <span className="text-sm font-bold text-[#F43F5E] shrink-0">{deal.remaining} due</span>
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
              <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">Live Deal Alerts & Approvals</h3>
              <span className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">Zero spam</span>
            </div>
            {[
              { title: "Payment Recorded", desc: "Rahul recorded ₹2,000 repayment. Please review and confirm.", time: "10 mins ago", unread: true },
              { title: "Counter-Offer Received", desc: "Supriya modified repayment schedule to monthly ₹3,000.", time: "2 hours ago", unread: false },
              { title: "Friendly Reminder", desc: "Repayment of ₹4,000 to Junaid scheduled for Friday.", time: "Yesterday", unread: false },
            ].map((notif, idx) => (
              <div key={idx} className={`p-4 border-[2px] border-black shadow-[3px_3px_0_0_#000000] flex items-start justify-between gap-4 font-mono ${
                notif.unread ? "bg-[#FFE600]/20 dark:bg-[#2E2800]" : "bg-[#FAF8F5] dark:bg-[#1E212D]"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 mt-1.5 shrink-0 border border-black ${notif.unread ? "bg-[#2563EB]" : "bg-gray-400"}`} />
                  <div>
                    <h5 className="text-sm font-bold text-black dark:text-white">{notif.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0 font-bold">{notif.time}</span>
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
                <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">Self Track: Private Offline Ledger</h3>
                <p className="font-mono text-xs text-purple-600 dark:text-purple-300">100% private to you · Never notifies anyone</p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 border border-black bg-[#FFE600] text-black font-bold uppercase shadow-[2px_2px_0_0_#000000]">Standalone</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 font-mono">
              <div className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000000] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#059669] dark:text-[#2DD4BF] uppercase">Lent Offline</span>
                  <span className="text-xs font-bold text-black dark:text-white">₹3,500</span>
                </div>
                <h5 className="font-bold text-sm text-black dark:text-white">Rahul (Concert Tickets)</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Note: Told me he will pay via GPay next weekend</p>
                <div className="pt-2 flex justify-between items-center text-xs border-t border-black/10 dark:border-white/10">
                  <span className="text-[#059669] dark:text-[#2DD4BF] font-bold">₹1,500 repaid</span>
                  <span className="text-gray-500 dark:text-gray-400">₹2,000 remaining</span>
                </div>
              </div>

              <div className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000000] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F43F5E] uppercase">Borrowed Offline</span>
                  <span className="text-xs font-bold text-black dark:text-white">₹1,200</span>
                </div>
                <h5 className="font-bold text-sm text-black dark:text-white">Roommate (Wifi bill)</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Note: Pay cash before 1st of month</p>
                <div className="pt-2 flex justify-between items-center text-xs border-t border-black/10 dark:border-white/10">
                  <span className="text-[#F43F5E] font-bold">Active</span>
                  <span className="text-gray-500 dark:text-gray-400">₹1,200 remaining</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </RetroWindow>
    </section>
  );
}
