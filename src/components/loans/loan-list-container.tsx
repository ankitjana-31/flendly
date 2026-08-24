"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowUpRight, ArrowDownLeft, Badge, HelpCircle, Percent } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export interface LoanListItem {
  id: string;
  principalAmount: number;
  outstandingBalance: number;
  interestDesc: string;
  startDate: string;
  dueDate: string;
  status: "active" | "partially-paid" | "overdue" | "paid";
  counterparty: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface LoanListContainerProps {
  loans: LoanListItem[];
  type: "lent" | "borrowed";
}

export function LoanListContainer({ loans, type }: LoanListContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "partially-paid" | "overdue" | "paid">("all");

  const statusLabels: Record<string, string> = {
    active: "Active",
    "partially-paid": "Partially Paid",
    overdue: "Overdue",
    paid: "Paid",
  };

  const statusColors: Record<string, string> = {
    active: "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400",
    "partially-paid": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10 dark:bg-indigo-900/20 dark:text-indigo-400",
    overdue: "bg-red-50 text-red-700 ring-1 ring-red-700/10 dark:bg-red-900/20 dark:text-red-400",
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400",
  };

  // Filter & Search logic
  const filteredLoans = loans.filter((loan) => {
    // Tab filter
    if (selectedTab !== "all" && loan.status !== selectedTab) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const nameMatch = loan.counterparty?.full_name?.toLowerCase().includes(q) ?? false;
      const usernameMatch = loan.counterparty?.username.toLowerCase().includes(q) ?? false;
      return nameMatch || usernameMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls: Search + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1A1C23] pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg shrink-0">
          {(["all", "active", "partially-paid", "overdue", "paid"] as const).map((tab) => {
            const count = tab === "all" ? loans.length : loans.filter((l) => l.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize whitespace-nowrap ${
                  selectedTab === tab
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab === "all" ? "All" : tab.replace("-", " ")}
                <span className="ml-1 px-1.5 py-0.25 text-[10px] rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30 dark:border-zinc-800/30">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Loan Cards */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-8 max-w-2xl mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto">
            {type === "lent" ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No agreements found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {type === "lent"
                ? "You haven't lent anyone money yet. When you create an agreement and terms are accepted, your active lent agreements will appear here."
                : "You don't have any borrowed money agreements. When a peer proposes terms and you accept, your outstanding balances will appear here."}
            </p>
          </div>
          <Link
            href="/requests/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 text-xs font-semibold text-white dark:text-zinc-950 transition-colors"
          >
            Create Proposal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map((loan) => {
            const countdownDays = Math.ceil(
              (new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = loan.status === "overdue";

            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="group flex flex-col justify-between bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top: Profile + Status */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {loan.counterparty?.avatar_url ? (
                        <img
                          src={loan.counterparty.avatar_url}
                          alt={loan.counterparty.full_name || "User"}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold uppercase shrink-0">
                          {loan.counterparty?.username.substring(0, 2) || "U"}
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                          {type === "lent" ? "Borrower" : "Lender"}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5 group-hover:text-zinc-950 dark:group-hover:text-zinc-100">
                          {loan.counterparty?.full_name || "Monly User"}
                        </h4>
                        <p className="text-xs text-zinc-500">@{loan.counterparty?.username}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusColors[loan.status]}`}>
                      {statusLabels[loan.status]}
                    </span>
                  </div>

                  {/* Middle: Principal vs Outstanding */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-100 dark:border-zinc-800/50 py-3">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Outstanding</span>
                      <span className="text-base font-bold text-zinc-900 dark:text-white font-mono block mt-0.5">
                        ₹{loan.outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Principal</span>
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5">
                        ₹{loan.principalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Lower middle: terms */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-2 rounded-lg border border-zinc-200/20 dark:border-zinc-800/20">
                    <Percent className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="truncate">{loan.interestDesc}</span>
                  </div>
                </div>

                {/* Bottom: Countdown / Action */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/30 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      {loan.status === "paid" ? (
                        "Fully Settled"
                      ) : isOverdue ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          Overdue by {Math.abs(countdownDays)} days
                        </span>
                      ) : (
                        `Due in ${countdownDays} days`
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:underline">
                    View Ledger &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
