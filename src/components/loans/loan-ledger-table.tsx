"use client";

import React from "react";
import { format } from "date-fns";
import { accrueInterest } from "@/lib/interest/engine";

interface Payment {
  id: string;
  payer_id: string;
  receiver_id: string;
  amount: string | number;
  interest_component: string | number;
  principal_component: string | number;
  overpaid_excess: string | number;
  payment_date: string;
  note: string | null;
  created_at: string;
}

interface LoanLedgerTableProps {
  loan: {
    principal_amount: string | number;
    interest_type: "none" | "simple" | "compound";
    interest_rate: string | number | null;
    interest_frequency: "daily" | "monthly" | "yearly" | null;
    compounding: "daily" | "monthly" | "yearly" | null;
    start_date: string;
  };
  payments: Payment[];
  borrowerName: string;
}

interface DisplayRow {
  key: string;
  date: string;
  payer: string;
  amount: number | null;
  interestComponent: number | null;
  principalComponent: number | null;
  overpaidExcess: number | null;
  remainingOutstanding: number;
  note: string;
}

export function LoanLedgerTable({ loan, payments, borrowerName }: LoanLedgerTableProps) {
  // Parse terms
  const startPrincipal = typeof loan.principal_amount === "string" ? parseFloat(loan.principal_amount) : loan.principal_amount;
  const rate = loan.interest_rate !== null ? (typeof loan.interest_rate === "string" ? parseFloat(loan.interest_rate) : loan.interest_rate) : null;

  // Build rows chronologically
  const sortedPayments = [...payments].sort((a, b) => {
    const dateCompare = a.payment_date.localeCompare(b.payment_date);
    if (dateCompare !== 0) return dateCompare;
    return a.created_at.localeCompare(b.created_at);
  });

  const displayRows: DisplayRow[] = [];

  // Add initial row
  displayRows.push({
    key: "start",
    date: loan.start_date,
    payer: "-",
    amount: null,
    interestComponent: null,
    principalComponent: null,
    overpaidExcess: null,
    remainingOutstanding: startPrincipal,
    note: "Agreement Activated",
  });

  let runningPrincipal = startPrincipal;
  let runningInterest = 0;
  let anchorDate = loan.start_date;

  for (const p of sortedPayments) {
    const pAmount = typeof p.amount === "string" ? parseFloat(p.amount) : p.amount;
    const pInterest = typeof p.interest_component === "string" ? parseFloat(p.interest_component) : p.interest_component;
    const pPrincipal = typeof p.principal_component === "string" ? parseFloat(p.principal_component) : p.principal_component;
    const pExcess = typeof p.overpaid_excess === "string" ? parseFloat(p.overpaid_excess) : p.overpaid_excess;

    // Accrue interest up to this payment date
    const accrued = accrueInterest(
      runningPrincipal,
      loan.interest_type,
      rate,
      loan.interest_frequency,
      loan.compounding,
      anchorDate,
      p.payment_date
    );

    runningInterest += accrued;

    // Apply components
    runningInterest -= pInterest;
    runningPrincipal -= pPrincipal;

    const remainingOutstanding = Math.max(0, runningPrincipal + runningInterest);

    displayRows.push({
      key: p.id,
      date: p.payment_date,
      payer: borrowerName,
      amount: pAmount,
      interestComponent: pInterest,
      principalComponent: pPrincipal,
      overpaidExcess: pExcess > 0 ? pExcess : null,
      remainingOutstanding,
      note: p.note || "Repayment payment",
    });

    anchorDate = p.payment_date;
  }

  return (
    <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Payer</th>
              <th className="px-6 py-4 text-right">Total Paid</th>
              <th className="px-6 py-4 text-right">Interest Alloc.</th>
              <th className="px-6 py-4 text-right">Principal Alloc.</th>
              <th className="px-6 py-4 text-right">Outstanding Bal.</th>
              <th className="px-6 py-4 max-w-xs">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
            {displayRows.map((row) => (
              <tr key={row.key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 font-medium whitespace-nowrap">
                  {format(new Date(row.date), "PP")}
                </td>
                <td className="px-6 py-4">{row.payer}</td>
                <td className="px-6 py-4 text-right font-semibold font-mono text-zinc-950 dark:text-white">
                  {row.amount !== null ? `₹${row.amount.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 text-right font-mono text-zinc-500">
                  {row.interestComponent !== null ? `₹${row.interestComponent.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 text-right font-mono text-zinc-500">
                  {row.principalComponent !== null ? `₹${row.principalComponent.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 text-right font-bold font-mono text-zinc-950 dark:text-white">
                  ₹{row.remainingOutstanding.toFixed(2)}
                </td>
                <td className="px-6 py-4 max-w-xs truncate italic text-zinc-500 dark:text-zinc-400" title={row.note}>
                  {row.note}
                  {row.overpaidExcess && (
                    <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-sans mt-0.5">
                      (Includes ₹{row.overpaidExcess.toFixed(2)} excess)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list view */}
      <div className="block sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {displayRows.map((row, idx) => (
          <div key={row.key} className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {row.key === "start" ? "Activation" : `Transaction #${idx}`}
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                  {format(new Date(row.date), "PP")}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Outstanding</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                  ₹{row.remainingOutstanding.toFixed(2)}
                </span>
              </div>
            </div>

            {row.key !== "start" && (
              <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30 text-center">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Total Paid</span>
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-white font-mono">
                    ₹{row.amount?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Interest</span>
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
                    ₹{row.interestComponent?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Principal</span>
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
                    ₹{row.principalComponent?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs text-zinc-500">
              <span className="italic truncate flex-1">{row.note}</span>
              {row.key !== "start" && (
                <span className="shrink-0 text-zinc-400 ml-2">Payer: {row.payer}</span>
              )}
            </div>
            {row.overpaidExcess && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Excess refund of ₹{row.overpaidExcess.toFixed(2)} recorded.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
