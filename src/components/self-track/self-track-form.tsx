"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, ArrowUpRight, ArrowDownLeft, FileText, Calendar, User, IndianRupee, Sparkles } from "lucide-react";
import { createSelfTrack } from "@/lib/self-track/actions";
import { RetroWindow } from "@/components/ui/retro-window";

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

    if (!personName.trim()) {
      setError("Please enter person name or note title");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSelfTrack({
        type,
        person_name: personName.trim(),
        amount: Number(amount),
        record_date: recordDate,
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to create record");
        return;
      }

      // Reset form on success
      setPersonName("");
      setAmount("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RetroWindow
      title="NEW RECORD // LOG OFFLINE"
      subtitle="private entry"
      colorBar="yellow"
      className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
      contentClassName="p-5 sm:p-6"
      headerRight={
        onClose ? (
          <button
            onClick={onClose}
            className="w-5 h-5 border border-black dark:border-white bg-[#F43F5E] text-white font-mono text-xs font-bold flex items-center justify-center hover:opacity-90"
          >
            ✕
          </button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] font-mono text-xs font-bold shadow-[2px_2px_0_0_#000]"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 border-[2px] border-black bg-[#2DD4BF] text-black font-mono text-xs font-black shadow-[2px_2px_0_0_#000] flex items-center gap-2"
          >
            <span>✓</span> RECORD SAVED TO PRIVATE LEDGER!
          </motion.div>
        )}

        {/* Dynamic Type Selector */}
        <div>
          <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
            Transaction Direction
          </label>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setType("lent")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 border-[2px] border-black font-bold uppercase transition-all ${
                type === "lent"
                  ? "bg-[#2DD4BF] text-black shadow-[3px_3px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Money I Lent</span>
            </button>

            <button
              type="button"
              onClick={() => setType("borrowed")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 border-[2px] border-black font-bold uppercase transition-all ${
                type === "borrowed"
                  ? "bg-[#F43F5E] text-white shadow-[3px_3px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Money I Borrowed</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Person Name */}
          <div>
            <label htmlFor="person-name" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              {type === "lent" ? "Lent To (Person)" : "Borrowed From (Person)"}
            </label>
            <input
              id="person-name"
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Ankit"
              className="w-full h-10 px-3 border-[2px] border-black dark:border-white/60 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white placeholder:text-gray-400 font-mono text-xs font-bold shadow-[2px_2px_0_0_#000000] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#059669]" />
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
              className="w-full h-10 px-3 border-[2px] border-black dark:border-white/60 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white placeholder:text-gray-400 font-mono text-xs font-black shadow-[2px_2px_0_0_#000000] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>
        </div>

        {/* Date & Note Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Date */}
          <div>
            <label htmlFor="record-date" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              Date
            </label>
            <input
              id="record-date"
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full h-10 px-2.5 border-[2px] border-black dark:border-white/60 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold shadow-[2px_2px_0_0_#000000] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Note */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Note / Context (Optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Dinner bill, promised to pay via UPI"
              className="w-full h-10 px-3 border-[2px] border-black dark:border-white/60 bg-[#FAF8F5] dark:bg-[#1E212D] text-black dark:text-white placeholder:text-gray-400 font-mono text-xs font-bold shadow-[2px_2px_0_0_#000000] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#FFE600] text-black border-[2.5px] border-black font-mono text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? "SAVING RECORD..." : "COMMIT TO PRIVATE LEDGER"}
          </button>
        </div>
      </form>
    </RetroWindow>
  );
}

