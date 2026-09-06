"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FinancialHorizonScreen } from "@/components/screens/financial-horizon";
import { NegotiationCockpit } from "@/components/screens/negotiation-cockpit";
import { SettlementSimulator } from "@/components/screens/settlement-simulator";
import { FriendshipDebtLedger } from "@/components/screens/friendship-debt-ledger";

export default function StitchScreensPage() {
  const [activeTab, setActiveTab] = useState<"horizon" | "negotiation" | "settlement" | "ledger">("horizon");

  const tabs = [
    { id: "horizon", label: "Financial Horizon", icon: "📊" },
    { id: "negotiation", label: "Negotiation Cockpit", icon: "🤝" },
    { id: "settlement", label: "Settlement Simulator", icon: "💰" },
    { id: "ledger", label: "Debt Ledger", icon: "📋" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "horizon" && <FinancialHorizonScreen />}
        {activeTab === "negotiation" && <NegotiationCockpit />}
        {activeTab === "settlement" && <SettlementSimulator />}
        {activeTab === "ledger" && <FriendshipDebtLedger />}
      </motion.div>
    </div>
  );
}
