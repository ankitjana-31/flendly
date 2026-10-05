"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Bell, Wallet, Zap } from "lucide-react";
import { RetroWindow } from "@/components/ui/retro-window";

export function LandingPreviewSection() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "lent" | "borrowed" | "notifications" | "selftrack">("dashboard");

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, tag: "Command Center" },
    { id: "lent" as const, label: "Lent", icon: ArrowUpRight, tag: "Money Given" },
    { id: "borrowed" as const, label: "Borrowed", icon: ArrowDownLeft, tag: "Money Taken" },
    { id: "notifications" as const, label: "Notifications", icon: Bell, tag: "Live Approvals" },
    { id: "selftrack" as const, label: "Self Track", icon: Wallet, tag: "Private Ledger" },
  ];

  return (
    <section className="landing-preview relative z-20 w-full max-w-[1400px] mx-auto mt-2 px-4 sm:px-6 pb-6">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-3 py-1 bg-[#2DD4BF] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000000] font-mono text-xs font-bold uppercase mb-2.5 rounded-[4px]">
          <span>EXPLORE FLENDLY</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-black dark:text-white tracking-tight uppercase">
          Everything you need to manage peer loans
        </h2>
        <p className="mt-1.5 text-[var(--muted-foreground)] max-w-2xl mx-auto font-sans text-sm sm:text-base font-normal">
          Lending, borrowing, repayment tracking, deal notifications, and a private offline ledger, all in one place.
        </p>
      </div>

      {/* Interactive Tabs Selector - Two Rows on Mobile, Centered on Desktop */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-2 pb-2 mb-4 sm:mb-5 max-w-full px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`landing-preview-tab flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[10px] font-mono text-[11px] sm:text-xs font-bold uppercase transition-all duration-200 border-[2px] border-black cursor-pointer ${
                isActive
                  ? "landing-preview-tab-active bg-[#FFE600] text-black shadow-[2.5px_2.5px_0_0_#000000] sm:shadow-[3px_3px_0_0_#000000] -translate-y-0.5 font-black"
                  : "landing-preview-tab-inactive bg-white dark:bg-[var(--muted)] text-black dark:text-white shadow-[2px_2px_0_0_#000000] hover:bg-[#FB7185] hover:text-white dark:hover:bg-[#FB7185] dark:hover:text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-current shrink-0" />
              <span className="font-black">{tab.label}</span>
              <span className={`landing-preview-tab-tag hidden md:inline-block text-[10px] px-1.5 py-0.5 border border-black rounded-[4px] ${
                isActive ? "bg-black !text-white font-bold" : "bg-[#2DD4BF] !text-black font-bold"
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
        className="rounded-[8px] bg-white dark:bg-[var(--card)] border-[2px] sm:border-[2.5px] border-black dark:border-white shadow-[4px_4px_0_0_#000000] sm:shadow-[6px_6px_0_0_#000000] dark:shadow-[4px_4px_0_0_#2563EB]"
        headerClassName="bg-[#2563EB] text-white"
        contentClassName="p-4 sm:p-6 md:p-10"
        headerRight={
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-white bg-black/20 px-2 py-0.5 border border-white/30 font-bold rounded-[3px]">
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
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#059669] dark:text-[#2DD4BF] block">Net Position</span>
                <p className="text-2xl sm:text-3xl font-bold font-display text-black dark:text-white mt-1 tracking-tight">+₹14,500</p>
                <span className="font-sans text-[11px] text-[#059669] dark:text-[#2DD4BF] mt-1 block font-medium">You are owed more than you owe</span>
              </div>
              <div className="p-5 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#2563EB] dark:text-[#93C5FD] block">Total Lent Out</span>
                <p className="text-2xl sm:text-3xl font-bold font-display text-black dark:text-white mt-1 tracking-tight">₹22,000</p>
                <span className="font-sans text-[11px] text-gray-600 dark:text-gray-400 mt-1 block font-medium">Across 3 active loans</span>
              </div>
              <div className="p-5 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] transition-all duration-200">
                <span className="font-mono text-xs uppercase font-bold text-[#F43F5E] dark:text-[#FDA4AF] block">Total Borrowed</span>
                <p className="text-2xl sm:text-3xl font-bold font-display text-black dark:text-white mt-1 tracking-tight">₹7,500</p>
                <span className="font-sans text-[11px] text-gray-600 dark:text-gray-400 mt-1 block font-medium">Due in 12 days</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 border-[2px] border-black bg-white dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] space-y-3">
                <h4 className="font-display text-sm font-bold text-black dark:text-white uppercase flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <span className="font-mono text-xs text-[#059669] dark:text-[#2DD4BF] font-bold">Auto-verified</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-black bg-[#FAF8F5] dark:bg-[#242938]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-black bg-[#2DD4BF] text-black flex items-center justify-center font-bold text-xs font-mono">IN</div>
                      <div>
                        <p className="text-sm font-semibold text-black dark:text-white font-sans">Ankit repaid installment</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Via UPI · 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#059669] dark:text-[#2DD4BF] font-display">+₹3,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-black bg-[#FAF8F5] dark:bg-[#242938]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-black bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs font-mono">OUT</div>
                      <div>
                        <p className="text-sm font-semibold text-black dark:text-white font-sans">Loan disbursed to Anushka</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">Fixed terms · Yesterday</p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#2563EB] dark:text-[#60A5FA] font-display">₹8,000</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border-[2px] border-black bg-white dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black bg-[#FFE600] text-black font-mono text-xs font-black uppercase mb-3 shadow-[2px_2px_0_0_#000000]">
                    <Zap className="w-3.5 h-3.5" /> Instant Counter-Offer
                  </div>
                  <h4 className="font-display text-base font-bold text-black dark:text-white uppercase">Smart Loan Negotiations</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed font-sans font-normal">
                    Review loan terms, propose different deadlines, or suggest custom interest, all within the app.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-xs font-bold">
                  <span className="text-gray-600 dark:text-gray-400">Negotiation engine active</span>
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
              <h3 className="font-display text-base font-bold text-black dark:text-white uppercase">Money You Lent Out</h3>
              <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#2DD4BF] bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">3 active borrowers</span>
            </div>
            {[
              { name: "Shanaya", amount: "₹12,000", repaid: "₹8,000", remaining: "₹4,000", progress: 66, status: "On Track" },
              { name: "Anushka", amount: "₹15,000", repaid: "₹5,000", remaining: "₹10,000", progress: 33, status: "Due 15 Oct" },
              { name: "Kunal", amount: "₹5,000", repaid: "₹5,000", remaining: "₹0", progress: 100, status: "Settled" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-black dark:text-white">{deal.name}</span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 border border-black font-bold uppercase ${
                      deal.progress === 100 ? "bg-[#2DD4BF] text-black" : "bg-blue-500 text-white"
                    }`}>
                      {deal.status}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-gray-600 dark:text-gray-400 mt-1">Total: <strong className="font-display font-bold">{deal.amount}</strong> · Repaid: <strong className="font-display font-bold">{deal.repaid}</strong></p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto sm:min-w-[180px]">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                      <div className="bg-[#2DD4BF] h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-1 block text-right font-bold">{deal.progress}% returned</span>
                  </div>
                  <span className="font-display text-sm font-bold text-[#059669] dark:text-[#2DD4BF] shrink-0">{deal.remaining} left</span>
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
              <h3 className="font-display text-base font-bold text-black dark:text-white uppercase">Money You Borrowed</h3>
              <span className="font-mono text-xs font-bold text-[#F43F5E] bg-rose-500/10 px-2 py-0.5 border border-rose-500/30">Clear repayment paths</span>
            </div>
            {[
              { name: "Rishi", amount: "₹10,000", repaid: "₹6,000", remaining: "₹4,000", progress: 60, nextDue: "Due in 8 days" },
              { name: "Anushka", amount: "₹4,000", repaid: "₹2,000", remaining: "₹2,000", progress: 50, nextDue: "Due in 20 days" },
            ].map((deal) => (
              <div key={deal.name} className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-black dark:text-white">{deal.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 border border-black font-bold uppercase bg-[#F43F5E] text-white">
                      {deal.nextDue}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-gray-600 dark:text-gray-400 mt-1">Initial loan: <strong className="font-display font-bold">{deal.amount}</strong> · Paid so far: <strong className="font-display font-bold">{deal.repaid}</strong></p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto sm:min-w-[180px]">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                      <div className="bg-[#F43F5E] h-full" style={{ width: `${deal.progress}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-1 block text-right font-bold">{deal.progress}% settled</span>
                  </div>
                  <span className="font-display text-sm font-bold text-[#F43F5E] shrink-0">{deal.remaining} due</span>
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
              <h3 className="font-display text-base font-bold text-black dark:text-white uppercase">Live Deal Alerts & Approvals</h3>
              <span className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">Zero spam</span>
            </div>
            {[
              { title: "Payment Recorded", desc: "Ankit recorded ₹2,000 repayment. Please review and confirm.", time: "10 mins ago", unread: true },
              { title: "Counter-Offer Received", desc: "Anushka modified repayment schedule to monthly ₹3,000.", time: "2 hours ago", unread: false },
              { title: "Friendly Reminder", desc: "Repayment of ₹4,000 to Rishi scheduled for Friday.", time: "Yesterday", unread: false },
            ].map((notif, idx) => (
              <div key={idx} className={`p-4 border-[2px] border-black shadow-[3px_3px_0_0_#000000] flex items-start justify-between gap-4 ${
                notif.unread ? "bg-[#FFE600]/20 dark:bg-[#2E2800]" : "bg-[#FAF8F5] dark:bg-[var(--muted)]"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 mt-1.5 shrink-0 border border-black ${notif.unread ? "bg-[#2563EB]" : "bg-gray-400"}`} />
                  <div>
                    <h5 className="font-display text-sm font-bold text-black dark:text-white">{notif.title}</h5>
                    <p className="font-sans text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 shrink-0 font-bold">{notif.time}</span>
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
                <h3 className="font-display text-base font-bold text-black dark:text-white uppercase">Self Track: Private Offline Ledger</h3>
                <p className="font-sans text-xs text-purple-600 dark:text-purple-300 font-medium">100% private to you · Never notifies anyone</p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 border border-black bg-[#FFE600] text-black font-bold uppercase shadow-[2px_2px_0_0_#000000]">Standalone</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#2DD4BF] uppercase">Lent Offline</span>
                  <span className="font-display text-base font-bold text-black dark:text-white">₹3,500</span>
                </div>
                <h5 className="font-display font-bold text-sm text-black dark:text-white">Ashok (Concert Tickets)</h5>
                <p className="font-sans text-xs text-gray-600 dark:text-gray-400">Note: Told me she will pay via UPI next weekend</p>
                <div className="pt-2 flex justify-between items-center text-xs border-t border-black/10 dark:border-white/10 font-mono">
                  <span className="text-[#059669] dark:text-[#2DD4BF] font-bold">₹1,500 repaid</span>
                  <span className="text-gray-500 dark:text-gray-400">₹2,000 remaining</span>
                </div>
              </div>

              <div className="p-4 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[3px_3px_0_0_#000000] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-[#F43F5E] uppercase">Borrowed Offline</span>
                  <span className="font-display text-base font-bold text-black dark:text-white">₹1,200</span>
                </div>
                <h5 className="font-display font-bold text-sm text-black dark:text-white">Rishi (Wifi bill)</h5>
                <p className="font-sans text-xs text-gray-600 dark:text-gray-400">Note: Pay cash before 1st of month</p>
                <div className="pt-2 flex justify-between items-center text-xs border-t border-black/10 dark:border-white/10 font-mono">
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
