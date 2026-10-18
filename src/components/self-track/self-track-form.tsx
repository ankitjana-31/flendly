"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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
      subtitle="add entry"
      colorBar="yellow"
      controlsStyle="none"
      className="bg-white dark:bg-[var(--card)] border-[2px] sm:border-[2.5px] border-black dark:border-white shadow-[3px_3px_0_0_#000] rounded-[8px]"
      contentClassName="p-4 sm:p-5"
      headerRight={
        onClose ? (
          <button
            onClick={onClose}
            className="w-6 h-6 border border-black dark:border-white bg-[#F43F5E] text-white font-mono text-xs font-bold flex items-center justify-center hover:opacity-90 rounded-[4px]"
          >
            ✕
          </button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border-[2px] border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-sm font-bold shadow-[2px_2px_0_0_#000] rounded-[6px]"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 border-[2px] border-black bg-[#2DD4BF] text-black text-sm font-black shadow-[2px_2px_0_0_#000] flex items-center gap-2 rounded-[6px]"
          >
            <span>✓</span> Record saved successfully!
          </motion.div>
        )}

        {/* Direction Selector: Side-by-side Segmented Buttons */}
        <div>
          <span className="block text-[15px] sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
            Transaction Direction
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("lent")}
              className={`flex items-center justify-center gap-2 h-12 min-h-[48px] px-3 border-[2px] border-black text-[15px] sm:text-base font-black uppercase transition-all rounded-[6px] cursor-pointer ${
                type === "lent"
                  ? "bg-[#2DD4BF] text-black shadow-[2.5px_2.5px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>Money I Lent</span>
            </button>

            <button
              type="button"
              onClick={() => setType("borrowed")}
              className={`flex items-center justify-center gap-2 h-12 min-h-[48px] px-3 border-[2px] border-black text-[15px] sm:text-base font-black uppercase transition-all rounded-[6px] cursor-pointer ${
                type === "borrowed"
                  ? "bg-[#F43F5E] text-white shadow-[2.5px_2.5px_0_0_#000000] -translate-y-0.5"
                  : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>Money I Borrowed</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid: 48px height, 16px text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Person Name */}
          <div>
            <label
              htmlFor="person-name"
              className="block text-[15px] sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              {type === "lent" ? "Lent to (Person)" : "Borrowed from (Person)"}
            </label>
            <input
              id="person-name"
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person's name"
              autoComplete="off"
              className="w-full h-12 min-h-[48px] px-3.5 border-[2px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-base font-bold shadow-[1.5px_1.5px_0_0_#000] rounded-[6px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-[15px] sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
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
              className="w-full h-12 min-h-[48px] px-3.5 border-[2px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-base font-black shadow-[1.5px_1.5px_0_0_#000] rounded-[6px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="record-date"
              className="block text-[15px] sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Date
            </label>
            <input
              id="record-date"
              type="date"
              required
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full h-12 min-h-[48px] px-3 border-[2px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white text-base font-bold shadow-[1.5px_1.5px_0_0_#000] rounded-[6px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="note"
              className="block text-[15px] sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Note / Context (Optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note or context"
              className="w-full h-12 min-h-[48px] px-3.5 border-[2px] border-black dark:border-white/50 bg-[#FAF8F5] dark:bg-[var(--muted)] text-black dark:text-white placeholder:text-gray-400 text-base font-bold shadow-[1.5px_1.5px_0_0_#000] rounded-[6px] focus:outline-none focus:bg-[#FEF08A] dark:focus:bg-[#2A2E3D] transition-colors"
            />
          </div>
        </div>

        {/* Save Record Action Button: 48px height, 16px font */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 min-h-[48px] bg-[#FFE600] text-black border-[2px] border-black font-mono text-base font-black uppercase shadow-[3px_3px_0_0_#000000] hover:bg-yellow-300 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer rounded-[6px]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{isSubmitting ? "SAVING..." : "SAVE RECORD"}</span>
          </button>
        </div>
      </form>
    </RetroWindow>
  );
}
