"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowUpRight, ArrowDownLeft, FileText, Calendar, User, IndianRupee, Sparkles } from "lucide-react";
import { createSelfTrack } from "@/lib/self-track/actions";

export interface SelfTrackFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function SelfTrackForm({ isOpen = true, onClose, onSuccess }: SelfTrackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"lent" | "borrowed">("lent");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!personName.trim()) {
        throw new Error("Please enter person name or note title");
      }
      if (!amount || Number(amount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      await createSelfTrack({
        type,
        person_name: personName.trim(),
        amount: Number(amount),
        record_date: recordDate,
        note: note.trim() || undefined,
      });

      // Reset form
      setPersonName("");
      setAmount("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        if (onClose) onClose();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 text-white font-bold shadow-lg shadow-teal-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Add Self Track Record</h3>
            <p className="text-xs text-muted-foreground">Private ledger entry · Only visible to you</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-3 rounded-2xl bg-success/15 border border-success/30 text-success text-xs font-bold flex items-center gap-2"
          >
            <span>✓</span> Record successfully saved to your private ledger!
          </motion.div>
        )}

        {/* Dynamic Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("lent")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-sm transition-all border ${
                type === "lent"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "bg-muted/50 border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Money I Lent</span>
            </button>

            <button
              type="button"
              onClick={() => setType("borrowed")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-sm transition-all border ${
                type === "borrowed"
                  ? "bg-gradient-to-r from-rose-500 to-red-500 text-white border-transparent shadow-lg shadow-rose-500/25 scale-[1.02]"
                  : "bg-muted/50 border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Money I Borrowed</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Person Name */}
          <div>
            <label htmlFor="person-name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-500" />
              {type === "lent" ? "Lent To (Person)" : "Borrowed From (Person)"}
            </label>
            <input
              id="person-name"
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Rahul, Aman, Roommate"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-bold font-tabular focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Date & Note Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label htmlFor="record-date" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              Date
            </label>
            <input
              id="record-date"
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background/80 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Note */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Personal Note / Reminder (Optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. For dinner bill, promised to pay via UPI"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? "Saving to Private Ledger..." : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
