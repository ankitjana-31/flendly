"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, DollarSign, Calendar } from "lucide-react";

export function NegotiationCockpit() {
  const [loanAmount, setLoanAmount] = useState(500);
  const [interestRate, setInterestRate] = useState(3);
  const [duration, setDuration] = useState(60);

  const monthlyPayment = (
    (loanAmount * (interestRate / 100) * duration) /
    12 /
    duration
  ).toFixed(2);
  const totalInterest = (
    loanAmount *
    (interestRate / 100) *
    (duration / 365)
  ).toFixed(2);
  const totalPayable = (
    parseFloat(loanAmount.toString()) + parseFloat(totalInterest)
  ).toFixed(2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-500/5 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Negotiation Cockpit
          </h1>
          <p className="text-muted-foreground mt-2">
            Adjust terms and see real-time interest calculations
          </p>
        </motion.div>

        {/* Main Negotiation Panel */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Lender Side */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold">
                L
              </div>
              <div>
                <p className="font-semibold">You (Lender)</p>
                <p className="text-xs text-muted-foreground">Original Terms</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Principal</span>
                <span className="font-semibold">${loanAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="font-semibold text-emerald-600">
                  {interestRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">{duration} days</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              Accept Deal
            </motion.button>
          </div>

          {/* Middle - Arrow & Negotiation Status */}
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-8 h-8 text-indigo-500" />
            </motion.div>
            <div className="text-center">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs font-semibold text-indigo-600">
                  NEGOTIATING
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Real-time terms adjustment
              </p>
            </div>
            <motion.div
              animate={{ x: [-10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-8 h-8 text-indigo-500 rotate-180" />
            </motion.div>
          </div>

          {/* Borrower Side */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white font-bold">
                B
              </div>
              <div>
                <p className="font-semibold">Borrower</p>
                <p className="text-xs text-muted-foreground">Counter-Offer</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Principal</span>
                <span className="font-semibold">${loanAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="font-semibold text-rose-600">
                  {Math.max(0, interestRate - 1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">{duration + 5} days</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 py-2 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-sm font-semibold hover:bg-rose-500/20 transition-colors"
            >
              Counter-Propose
            </motion.button>
          </div>
        </motion.div>

        {/* Interactive Sliders */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-card/60 p-8 backdrop-blur-xl">
            <h3 className="font-heading text-2xl font-bold mb-8">
              Adjust Terms
            </h3>

            <div className="space-y-8">
              {/* Principal Slider */}
              <SliderInput
                label="Principal Amount"
                icon={DollarSign}
                value={loanAmount}
                onChange={setLoanAmount}
                min={100}
                max={5000}
                step={50}
                suffix="$"
                color="emerald"
              />

              {/* Interest Rate Slider */}
              <SliderInput
                label="Interest Rate"
                icon={TrendingUp}
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={12}
                step={0.5}
                suffix="%"
                color="indigo"
              />

              {/* Duration Slider */}
              <SliderInput
                label="Loan Duration"
                icon={Calendar}
                value={duration}
                onChange={setDuration}
                min={30}
                max={365}
                step={5}
                suffix="days"
                color="amber"
              />
            </div>
          </div>
        </motion.div>

        {/* Calculation Summary */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <CalculationCard
            title="Monthly Payment"
            value={`$${monthlyPayment}`}
            color="blue"
          />
          <CalculationCard
            title="Total Interest"
            value={`$${totalInterest}`}
            color="indigo"
          />
          <CalculationCard
            title="Total Payable"
            value={`$${totalPayable}`}
            color="emerald"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function SliderInput({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  color,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "accent-emerald-500",
    indigo: "accent-indigo-500",
    amber: "accent-amber-500",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            <span className="text-lg text-muted-foreground ml-1">{suffix}</span>
          </p>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-border rounded-full appearance-none cursor-pointer ${colorMap[color]}`}
      />

      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function CalculationCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-600",
    indigo: "from-indigo-500/20 to-indigo-600/20 text-indigo-600",
    emerald: "from-emerald-500/20 to-emerald-600/20 text-emerald-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border border-border/60 bg-gradient-to-br ${colorMap[color]} p-6 backdrop-blur-sm`}
    >
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-3xl font-bold mt-3">{value}</p>
    </motion.div>
  );
}
