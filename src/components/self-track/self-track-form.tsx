"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ArrowDownLeft, FileText, Calendar, User, IndianRupee } from "lucide-react";
import { createSelfTrack } from "@/lib/self-track/actions";
import { RetroWindow } from "@/components/ui/retro-window";

export interface SelfTrackFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function SelfTrackForm({ isOpen = true, onClose, onSuccess }: SelfTrackFormProps) {
  const router = useRouter();
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
      setError("Please enter person name");
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
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RetroWindow
      title="NEW RECORD"
      subtitle="private entry"
      colorBar="yellow"
      controlsStyle="none"
      className="bg-white dark:bg-[var(--card)] border-[2px] sm:border-[2.5px] border-black dark:border-white shadow-[3px_3px_0_0_#000] rounded-[8px]"
      contentClassName="p-3 sm:p-4"
      headerRight={
        onClose ? (
          <button
            onClick={onClose}
            className="w-5 h-5 border border-black dark:border-white bg-[#F43F5E] text-white font-mono text-xs font-bold flex items-center justify-center hover:opacity-90 rounded-[3px]"
          >
            ✕
          </button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-2.5 font-mono">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 border-[1.5px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold shadow-[1px_1px_0_0_#000] rounded-[4px]"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2 border-[1.5px] border-black bg-[#2DD4BF] text-black text-xs font-black shadow-[1px_1px_0_0_#000] flex items-center gap-1.5 rounded-[4px]"
          >
            <span>✓</span> RECORD SAVED TO PRIVATE LEDGER!
          </motion.div>
        )}

        {/* Compact Segmented Direction Selector */}
        <div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setType("lent")}
              className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-2 border-[1.5px] border-black font-black uppercase transition-all rounded-[4px] cursor-pointer ${
                type === "lent"
                  ? "bg-[#2DD4BF] text-black shadow-[2px_2px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Money I Lent</span>
            </button>

            <button
              type="button"
              onClick={() => setType("borrowed")}
              className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-2 border-[1.5px] border-black font-black uppercase transition-all rounded-[4px] cursor-pointer ${
                type === "borrowed"
                  ? "bg-[#F43F5E] text-white shadow-[2px_2px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Money I Borrowed</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {/* Person Name */}
          <div>
            <label
              htmlFor="person-name"
              className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-0.5 flex items-center gap-1"
            >
              <User className="w-3 h-3 text-[#2563EB]" />
              {type === "lent" ? "Lent To (Person)" : "Borrowed From (Person)"}
            </label>
            <input
              id="person-name"
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Rahul, Alex"
              className="w-full h-8 sm:h-8.5 px-2.5 border-[1.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-xs font-bold shadow-[1px_1px_0_0_#000] rounded-[4px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-0.5 flex items-center gap-1"
            >
              <IndianRupee className="w-3 h-3 text-[#059669]" />
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
              placeholder="0.00"
              className="w-full h-8 sm:h-8.5 px-2.5 border-[1.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-xs font-black shadow-[1px_1px_0_0_#000] rounded-[4px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="record-date"
              className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-0.5 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-[#2563EB]" />
              Date
            </label>
            <input
              id="record-date"
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full h-8 sm:h-8.5 px-2 border-[1.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white text-xs font-bold shadow-[1px_1px_0_0_#000] rounded-[4px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="note"
              className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-0.5 flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-amber-500" />
              Note / Context (Optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Dinner split, Uber"
              className="w-full h-8 sm:h-8.5 px-2.5 border-[1.5px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-xs font-bold shadow-[1px_1px_0_0_#000] rounded-[4px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 sm:h-9.5 bg-[#FFE600] text-black border-[2px] border-black font-mono text-xs sm:text-sm font-black uppercase shadow-[2.5px_2.5px_0_0_#000000] hover:bg-yellow-300 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-[4px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? "SAVING..." : "SAVE RECORD"}</span>
          </button>
        </div>
      </form>
    </RetroWindow>
  );
}
