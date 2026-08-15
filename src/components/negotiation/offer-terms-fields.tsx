"use client";

import { useState } from "react";

type InterestType = "none" | "simple" | "compound";
type Frequency = "daily" | "monthly" | "yearly";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "text-sm font-medium text-foreground";

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
  const [interestType, setInterestType] = useState<InterestType>(defaults?.interestType ?? "simple");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="amount">
          Amount (₹)
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

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Interest</span>
        <div className="grid grid-cols-3 gap-2">
          {(["none", "simple", "compound"] as const).map((type) => (
            <label
              key={type}
              className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium capitalize transition-colors ${
                interestType === type
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="interestType"
                value={type}
                checked={interestType === type}
                onChange={() => setInterestType(type)}
                className="sr-only"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {interestType !== "none" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="interestRate">
              Rate (%)
            </label>
            <input
              id="interestRate"
              name="interestRate"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={defaults?.interestRate}
              className={inputClass}
              placeholder="5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="interestFrequency">
              Per
            </label>
            <select
              id="interestFrequency"
              name="interestFrequency"
              required
              defaultValue={defaults?.interestFrequency ?? "monthly"}
              className={inputClass}
            >
              <option value="daily">Day</option>
              <option value="monthly">Month</option>
              <option value="yearly">Year</option>
            </select>
          </div>
        </div>
      )}

      {interestType === "compound" && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="compounding">
            Compounding frequency
          </label>
          <select
            id="compounding"
            name="compounding"
            required
            defaultValue={defaults?.compounding ?? "monthly"}
            className={inputClass}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="deadline">
          Repay by
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

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="message">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={2}
          maxLength={500}
          defaultValue={defaults?.message}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          placeholder="What's this for?"
        />
      </div>
    </div>
  );
}
