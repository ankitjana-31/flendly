"use client";

import React from "react";

interface InterestSelectorProps {
  interestType: "none" | "simple" | "compound";
  setInterestType: (type: "none" | "simple" | "compound") => void;
  interestRate: number | "";
  setInterestRate: (rate: number | "") => void;
  interestFrequency: "daily" | "monthly" | "yearly";
  setInterestFrequency: (freq: "daily" | "monthly" | "yearly") => void;
  compounding: "daily" | "monthly" | "yearly";
  setCompounding: (comp: "daily" | "monthly" | "yearly") => void;
  disabled?: boolean;
}

export function InterestSelector({
  interestType,
  setInterestType,
  interestRate,
  setInterestRate,
  interestFrequency,
  setInterestFrequency,
  compounding,
  setCompounding,
  disabled = false,
}: InterestSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Interest Type
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
          {(["none", "simple", "compound"] as const).map((type) => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => setInterestType(type)}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                interestType === type
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {type === "none" ? "No Interest" : type}
            </button>
          ))}
        </div>
      </div>

      {interestType !== "none" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          {/* Interest Rate */}
          <div className="space-y-1.5">
            <label htmlFor="interestRate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Interest Rate (%)
            </label>
            <div className="relative rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-100 overflow-hidden">
              <input
                id="interestRate"
                type="number"
                step="0.001"
                min="0"
                required
                disabled={disabled}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                placeholder="5.0"
                className="h-10 w-full bg-transparent px-3 text-sm text-zinc-900 dark:text-white outline-none pr-8"
              />
              <span className="absolute right-3 top-2.5 text-zinc-400 text-sm font-semibold">%</span>
            </div>
          </div>

          {/* Interest Frequency */}
          <div className="space-y-1.5">
            <label htmlFor="interestFrequency" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Accrual Frequency
            </label>
            <select
              id="interestFrequency"
              disabled={disabled}
              value={interestFrequency}
              onChange={(e) => setInterestFrequency(e.target.value as any)}
              className="h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#1A1C23] px-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Compounding Frequency (only compound interest) */}
          {interestType === "compound" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="compounding" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Compounding Period
              </label>
              <select
                id="compounding"
                disabled={disabled}
                value={compounding}
                onChange={(e) => setCompounding(e.target.value as any)}
                className="h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#1A1C23] px-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
