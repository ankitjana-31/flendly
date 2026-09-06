"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Zap, TrendingDown } from "lucide-react";

export function SettlementSimulator() {
  const [monthlyPayment, setMonthlyPayment] = useState(150);
  const [paymentMethod, setPaymentMethod] = useState("venmo");

  // Simplified payoff calculation
  const principal = 1000;
  const interestRate = 0.03;
  const monthsToPayoff = Math.ceil(principal / monthlyPayment);
  const totalInterest = principal * interestRate * (monthsToPayoff / 12);
  const savings = principal * interestRate * 0.6; // Early payoff savings

  const paymentMethods = [
    { id: "venmo", name: "Venmo", icon: "💰", color: "blue" },
    { id: "paypal", name: "PayPal", icon: "🔵", color: "indigo" },
    { id: "stripe", name: "Stripe", icon: "🟣", color: "purple" },
    { id: "bank", name: "Bank Transfer", icon: "🏦", color: "emerald" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-500/5 p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Settlement Simulator
          </h1>
          <p className="text-muted-foreground mt-2">
            See how early payments save you money
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Calculator */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-card/60 p-8 backdrop-blur-xl mb-6">
              <h3 className="font-heading text-2xl font-bold mb-6">
                What if I pay more?
              </h3>

              {/* Monthly Payment Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="font-semibold">Monthly Payment</label>
                  <motion.div
                    key={monthlyPayment}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-emerald-600"
                  >
                    ${monthlyPayment}
                  </motion.div>
                </div>

                <input
                  type="range"
                  min={100}
                  max={500}
                  step={10}
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(parseInt(e.target.value))}
                  className="w-full h-3 bg-border rounded-full appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>$100</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Payoff Timeline */}
              <div className="bg-background/40 rounded-2xl p-6 border border-border/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold">Payoff Timeline</h4>
                </div>

                <div className="space-y-4">
                  <PayoffTimeline
                    month={1}
                    remaining={principal - monthlyPayment}
                    payment={monthlyPayment}
                  />
                  <PayoffTimeline
                    month={Math.ceil(monthsToPayoff / 2)}
                    remaining={principal - monthlyPayment * (monthsToPayoff / 2)}
                    payment={monthlyPayment}
                  />
                  <PayoffTimeline
                    month={monthsToPayoff}
                    remaining={0}
                    payment={monthlyPayment}
                    final
                  />
                </div>
              </div>

              {/* Savings Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-green-600/20 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      Total Savings with Early Payoff
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                      ${savings.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      vs. standard 12-month payment plan
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Comparison Metrics */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <MetricCard
                label="Months to Payoff"
                value={monthsToPayoff}
                unit="months"
                color="blue"
              />
              <MetricCard
                label="Total Interest"
                value={`$${totalInterest.toFixed(2)}`}
                color="indigo"
              />
            </motion.div>
          </motion.div>

          {/* Right: Payment Methods */}
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/80 to-card/60 p-8 backdrop-blur-xl sticky top-8">
              <h3 className="font-heading text-xl font-bold mb-6">
                Record Payment
              </h3>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  Select Payment Method
                </p>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        paymentMethod === method.id
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-border/40 bg-background/20 hover:border-border/60"
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold text-sm">{method.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-background/40 rounded-2xl p-4 border border-border/30 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">${monthlyPayment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-semibold">$0</span>
                </div>
                <div className="border-t border-border/30 pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${monthlyPayment}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Record Payment & Notify Peer
              </motion.button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your peer will receive instant notification
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function PayoffTimeline({
  month,
  remaining,
  payment,
  final,
}: {
  month: number;
  remaining: number;
  payment: number;
  final?: boolean;
}) {
  const percentage = (remaining / 1000) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Month {month}</span>
        <span className="text-muted-foreground">
          {final ? "PAID" : `$${remaining.toFixed(0)} remaining`}
        </span>
      </div>
      <div className="relative h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${100 - percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            final
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-emerald-400 to-green-500"
          }`}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-600",
    indigo: "from-indigo-500/20 to-indigo-600/20 text-indigo-600",
    emerald: "from-emerald-500/20 to-emerald-600/20 text-emerald-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border border-border/60 bg-gradient-to-br ${colorMap[color]} p-4 backdrop-blur-sm`}
    >
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}
