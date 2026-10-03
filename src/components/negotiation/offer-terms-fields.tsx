"use client";

import { useState } from "react";
import { Check, Percent, Calendar, FileText, IndianRupee } from "lucide-react";

type InterestType = "none" | "simple" | "compound";
type Frequency = "daily" | "monthly" | "yearly";

const inputClass =
  "h-11 w-full rounded-[10px] border-[2px] border-black dark:border-white/60 bg-white dark:bg-[var(--card)] px-3 font-mono text-sm font-bold text-black dark:text-white shadow-[2px_2px_0_0_#000] outline-none transition-all focus:bg-[#FEF08A] focus:text-black";
const labelClass = "text-xs font-bold uppercase text-black dark:text-white flex items-center gap-1.5";

export function OfferTermsFields({
  defaults,
}: {
  defaults?: {
    amount?: string;
    interestType?: InterestType;
    interestRate?: string;
    interestFrequency?: Frequency;
    compounding?: Frequency;
    deadline?: string;
    message?: string;
  };
}) {
  const [interestType, setInterestType] = useState<InterestType>(defaults?.interestType ?? "none");
  const [interestFrequency, setInterestFrequency] = useState<Frequency>(defaults?.interestFrequency ?? "monthly");
  const [compounding, setCompounding] = useState<Frequency>(defaults?.compounding ?? "monthly");

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Amount Input */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="amount">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Principal Amount (₹)</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="0.01"
          required
          defaultValue={defaults?.amount}
          className={inputClass}
          placeholder="10000"
        />
      </div>

      {/* Interest Type Selector with Yellow Filled Active Feedback */}
      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>
          <Percent className="w-3.5 h-3.5" />
          <span>Interest Model</span>
        </span>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(["none", "simple", "compound"] as const).map((type) => {
            const isSelected = interestType === type;
            return (
              <label
                key={type}
                className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-[2.5px] border-black font-mono text-xs sm:text-sm font-black uppercase transition-all select-none ${
                  isSelected
                    ? "bg-[#FFE600] !text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5"
                    : "bg-[var(--card)] text-[var(--foreground)] shadow-[1.5px_1.5px_0_0_#000] hover:bg-[#FFE600] hover:!text-black"
                }`}
              >
                <input
                  type="radio"
                  name="interestType"
                  value={type}
                  checked={isSelected}
                  onChange={() => setInterestType(type)}
                  className="sr-only"
                />
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] !text-black" />}
                <span className={isSelected ? "!text-black" : "text-[var(--foreground)]"}>
                  {type === "none" ? "No Interest" : type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rate and Frequency Fields */}
      {interestType !== "none" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[10px] border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[2px_2px_0_0_#000]">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="interestRate">
              <span>Interest Rate (%)</span>
            </label>
            <input
              id="interestRate"
              name="interestRate"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={defaults?.interestRate ?? "5"}
              className={inputClass}
              placeholder="5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              <span>Accrual Interval</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 h-11">
              {[
                { value: "daily" as const, label: "Day" },
                { value: "monthly" as const, label: "Month" },
                { value: "yearly" as const, label: "Year" },
              ].map((opt) => {
                const isSelected = interestFrequency === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-center cursor-pointer rounded-[8px] border-[2px] border-black font-mono text-xs font-bold uppercase transition-all select-none ${
                      isSelected
                        ? "bg-[#FFE600] !text-black shadow-[2px_2px_0_0_#000] font-black"
                        : "bg-white dark:bg-[var(--card)] text-black dark:text-white shadow-[1px_1px_0_0_#000] hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="interestFrequency"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setInterestFrequency(opt.value)}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compounding Frequency */}
      {interestType === "compound" && (
        <div className="flex flex-col gap-1.5 p-3.5 rounded-[10px] border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[2px_2px_0_0_#000]">
          <label className={labelClass}>
            <span>Compounding Frequency</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 h-11">
            {[
              { value: "daily" as const, label: "Daily" },
              { value: "monthly" as const, label: "Monthly" },
              { value: "yearly" as const, label: "Yearly" },
            ].map((opt) => {
              const isSelected = compounding === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center cursor-pointer rounded-[8px] border-[2px] border-black font-mono text-xs font-bold uppercase transition-all select-none ${
                    isSelected
                      ? "bg-[#FFE600] !text-black shadow-[2px_2px_0_0_#000] font-black"
                      : "bg-white dark:bg-[var(--card)] text-black dark:text-white shadow-[1px_1px_0_0_#000] hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="compounding"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setCompounding(opt.value)}
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Repay By Deadline */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="deadline">
          <Calendar className="w-3.5 h-3.5" />
          <span>Closure / Repay By Date</span>
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          required
          defaultValue={defaults?.deadline}
          className={inputClass}
        />
      </div>

      {/* Message Note */}
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="message">
          <FileText className="w-3.5 h-3.5" />
          <span>Context / Note (Optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={2}
          maxLength={500}
          defaultValue={defaults?.message}
          className="w-full rounded-[10px] border-[2px] border-black dark:border-white/60 bg-white dark:bg-[var(--card)] px-3 py-2 font-mono text-sm font-bold text-black dark:text-white shadow-[2px_2px_0_0_#000] outline-none transition-all focus:bg-[#FEF08A] focus:text-black"
          placeholder="Note / context"
        />
      </div>
    </div>
  );
}
