"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  History, 
  IndianRupee, 
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { SelfTrackWithPayments } from "@/lib/types/self-track";
import { formatMoney, formatDate } from "@/lib/format";
import { updateSelfTrackStatus, deleteSelfTrack, deleteSelfTrackPayment, addSelfTrackPayment } from "@/lib/self-track/actions";

export interface SelfTrackListProps {
  records: SelfTrackWithPayments[];
  onRecordDeleted?: () => void;
}

// Inline toast component for instant feedback
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 border-[2px] border-black px-4 py-2.5 font-mono text-sm font-bold shadow-[3px_3px_0_0_#000] rounded-[6px] ${
        type === "success"
          ? "bg-[#2DD4BF] text-black"
          : "bg-[#F43F5E] text-white"
      }`}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </motion.div>
  );
}

export function SelfTrackList({ records: initialRecords, onRecordDeleted }: SelfTrackListProps) {
  // Local optimistic state — mirrors server records, updated instantly
  const [records, setRecords] = useState<SelfTrackWithPayments[]>(initialRecords);
  const [filter, setFilter] = useState<"all" | "lent" | "borrowed" | "active" | "settled">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Payment recording state
  const [activePaymentRecordId, setActivePaymentRecordId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // OPTIMISTIC: Toggle status instantly, then sync server
  const handleToggleStatus = async (recordId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "settled" : "active";
    const prev = records;

    // Instantly update local state
    setRecords((rs) =>
      rs.map((r) => (r.id === recordId ? { ...r, status: newStatus as "active" | "settled" } : r))
    );
    showToast(newStatus === "settled" ? "Marked as settled!" : "Marked as active!", "success");

    try {
      const res = await updateSelfTrackStatus(recordId, newStatus as "active" | "settled");
      if (!res.success) {
        // Revert on failure
        setRecords(prev);
        showToast(res.error || "Failed to update status", "error");
      } else {
        onRecordDeleted?.();
      }
    } catch {
      setRecords(prev);
      showToast("Network error — change reverted", "error");
    }
  };

  // OPTIMISTIC: Delete instantly, then sync server
  const handleDelete = async (recordId: string) => {
    if (!confirm("Delete this private record? This cannot be undone.")) return;
    const prev = records;

    // Instantly remove from UI
    setRecords((rs) => rs.filter((r) => r.id !== recordId));
    showToast("Record deleted.", "success");

    try {
      const res = await deleteSelfTrack(recordId);
      if (!res.success) {
        setRecords(prev);
        showToast(res.error || "Failed to delete record", "error");
      } else {
        onRecordDeleted?.();
      }
    } catch {
      setRecords(prev);
      showToast("Network error — deletion reverted", "error");
    }
  };

  // OPTIMISTIC: Add payment instantly with a temp ID, then confirm from server
  const handleRecordPayment = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    setPaymentError(null);

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      setPaymentError("Payment amount must be greater than 0");
      return;
    }

    const tempPayment = {
      id: "__temp__" + Date.now(),
      self_track_id: recordId,
      amount: amt.toString(),
      payment_date: paymentDate,
      note: paymentNote.trim() || null,
      created_at: new Date().toISOString(),
    };

    const prev = records;

    // Instantly reflect payment in the UI
    setRecords((rs) =>
      rs.map((r) =>
        r.id === recordId
          ? { ...r, payments: [...r.payments, tempPayment] }
          : r
      )
    );
    setActivePaymentRecordId(null);
    setPaymentAmount("");
    setPaymentNote("");
    showToast("Installment payment logged!", "success");

    setIsRecordingPayment(true);
    try {
      const res = await addSelfTrackPayment({
        self_track_id: recordId,
        amount: amt,
        payment_date: paymentDate,
        note: paymentNote.trim() || undefined,
      });

      if (!res.success) {
        setRecords(prev);
        showToast(res.error || "Failed to save payment", "error");
      } else {
        onRecordDeleted?.();
      }
    } catch {
      setRecords(prev);
      showToast("Network error — payment reverted", "error");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // OPTIMISTIC: Delete payment instantly, then sync server
  const handleDeletePayment = async (paymentId: string, recordId: string) => {
    if (!confirm("Delete this payment log?")) return;
    const prev = records;

    setRecords((rs) =>
      rs.map((r) =>
        r.id === recordId
          ? { ...r, payments: r.payments.filter((p) => p.id !== paymentId) }
          : r
      )
    );
    showToast("Payment deleted.", "success");

    try {
      const res = await deleteSelfTrackPayment(paymentId, recordId);
      if (!res.success) {
        setRecords(prev);
        showToast(res.error || "Failed to delete payment", "error");
      } else {
        onRecordDeleted?.();
      }
    } catch {
      setRecords(prev);
      showToast("Network error — deletion reverted", "error");
    }
  };

  const filteredRecords = records.filter((rec) => {
    if (filter === "lent") return rec.type === "lent";
    if (filter === "borrowed") return rec.type === "borrowed";
    if (filter === "active") return rec.status === "active";
    if (filter === "settled") return rec.status === "settled";
    return true;
  });

  return (
    <div className="space-y-3 font-mono">
      {/* Instant Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.message + toast.type}
            message={toast.message}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Filter Buttons: 14 to 16px font, comfortable tap height */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar py-0.5">
        {[
          { id: "all", label: `All (${records.length})` },
          { id: "lent", label: `Lent (${records.filter(r => r.type === "lent").length})` },
          { id: "borrowed", label: `Borrowed (${records.filter(r => r.type === "borrowed").length})` },
          { id: "active", label: `Active (${records.filter(r => r.status === "active").length})` },
          { id: "settled", label: `Settled (${records.filter(r => r.status === "settled").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`h-9 sm:h-10 px-3.5 text-sm font-bold transition-all border-[2px] border-black rounded-[6px] shrink-0 whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? "bg-[#FFE600] text-black shadow-[2px_2px_0_0_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[var(--muted)] text-gray-700 dark:text-gray-200 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-8 text-center bg-white dark:bg-[var(--card)] shadow-[2.5px_2.5px_0_0_#000] rounded-[8px]">
          <div className="w-10 h-10 border-[2px] border-black bg-[#FFE600] flex items-center justify-center mx-auto mb-2 text-black font-bold rounded-[6px] text-lg">
            ⚡
          </div>
          <h3 className="text-base font-bold text-black dark:text-white">
            No records in this category
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Use the form above to add a private record for offline loans or cash splits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredRecords.map((record) => {
            const isLent = record.type === "lent";
            const originalAmount = Number(record.amount);
            const totalPaid = record.payments.reduce((acc, p) => acc + Number(p.amount), 0);
            const remaining = Math.max(0, originalAmount - totalPaid);
            const progress = originalAmount > 0 ? Math.min(100, Math.round((totalPaid / originalAmount) * 100)) : 0;
            const isSettled = record.status === "settled";
            const isFullyPaid = remaining === 0;
            const isExpanded = expandedId === record.id;
            const isAddingPayment = activePaymentRecordId === record.id;

            return (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className={`border-[2px] border-black dark:border-white/50 bg-white dark:bg-[var(--card)] shadow-[3px_3px_0_0_#000] rounded-[8px] overflow-hidden transition-all ${
                  isSettled ? "opacity-85" : ""
                }`}
              >
                {/* Header Strip: Direction, Date, Status */}
                <div
                  className={`px-3.5 py-2 border-b-[1.5px] border-black/20 dark:border-white/20 flex items-center justify-between text-sm ${
                    isLent
                      ? "bg-[#2DD4BF]/15 dark:bg-[#0B3D30]/60"
                      : "bg-[#F43F5E]/10 dark:bg-[#3D0C1D]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] border border-black font-black text-xs uppercase tracking-wide ${
                        isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                      }`}
                    >
                      {isLent ? "I Lent" : "I Borrowed"}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(record.record_date)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-[4px] border border-black text-xs font-black uppercase ${
                      isSettled ? "bg-[#10B981] text-black" : "bg-[#FFE600] text-black"
                    }`}
                  >
                    {isSettled ? "Settled" : "Active"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  {/* Person Name & Amount: 19 to 22px */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-black text-black dark:text-white break-words">
                        <span className="text-gray-500 font-semibold text-sm mr-1">
                          {isLent ? "To:" : "From:"}
                        </span>
                        <span>{record.person_name}</span>
                      </h3>
                      {record.note && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-start gap-1.5 italic break-words">
                          <FileText className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <span>{record.note}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs uppercase text-gray-400 block font-bold">Total</span>
                      <p className={`text-xl sm:text-2xl font-black ${isLent ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E] dark:text-[#FB7185]"}`}>
                        {formatMoney(originalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Clean Repayment Progress Bar & Non-contradictory Status */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                      <span className="text-gray-600 dark:text-gray-400">
                        {isSettled
                          ? isFullyPaid
                            ? `Fully repaid (${formatMoney(totalPaid)})`
                            : `${progress}% paid in app (${formatMoney(totalPaid)})`
                          : `${progress}% paid (${formatMoney(totalPaid)})`}
                      </span>
                      <span
                        className={
                          isSettled
                            ? "text-[#059669] dark:text-[#2DD4BF] font-black"
                            : remaining === 0
                            ? "text-[#059669] dark:text-[#2DD4BF]"
                            : "text-black dark:text-white font-black"
                        }
                      >
                        {isSettled
                          ? isFullyPaid
                            ? "Cleared"
                            : "Settled offline"
                          : `${formatMoney(remaining)} remaining`}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black/50 dark:border-white/30 h-2.5 rounded-[3px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${isSettled && isFullyPaid ? 100 : progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`h-full ${isLent ? "bg-[#2DD4BF]" : "bg-[#F43F5E]"}`}
                      />
                    </div>
                  </div>

                  {/* Accessible Action Buttons: 14 to 16px font */}
                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-black/10 dark:border-white/10 text-sm">
                    <div className="flex items-center gap-2">
                      {!isSettled && (
                        <button
                          onClick={() => {
                            setActivePaymentRecordId(isAddingPayment ? null : record.id);
                            setPaymentAmount(remaining.toString());
                          }}
                          className="h-8.5 px-3 text-xs sm:text-sm font-black uppercase border-[1.5px] border-black bg-[#FFE600] text-black shadow-[1.5px_1.5px_0_0_#000] hover:bg-yellow-300 active:translate-y-0.5 rounded-[4px] flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Record Pay</span>
                        </button>
                      )}

                      {record.payments.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                          className="h-8.5 px-3 text-xs sm:text-sm font-bold uppercase border-[1.5px] border-black bg-white dark:bg-[var(--muted)] text-black dark:text-white shadow-[1px_1px_0_0_#000] hover:bg-gray-100 rounded-[4px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-gray-400" />
                          <span>Logs ({record.payments.length})</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(record.id, record.status)}
                        className={`h-8.5 px-3 text-xs sm:text-sm font-bold uppercase border-[1.5px] border-black rounded-[4px] shadow-[1.5px_1.5px_0_0_#000] cursor-pointer flex items-center gap-1.5 transition-all ${
                          isSettled
                            ? "bg-[#2DD4BF] text-black hover:bg-teal-300"
                            : "bg-white dark:bg-[var(--muted)] text-black dark:text-white hover:bg-gray-100"
                        }`}
                      >
                        {isSettled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                            <span>Settled</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Mark Settled</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(record.id)}
                        className="h-8.5 w-8.5 border-[1.5px] border-black bg-[#F43F5E] text-white rounded-[4px] shadow-[1.5px_1.5px_0_0_#000] hover:opacity-90 flex items-center justify-center cursor-pointer transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Repayment Form */}
                  <AnimatePresence>
                    {isAddingPayment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.16 }}
                        className="mt-3 p-3.5 border-[2px] border-black bg-[#FAF8F5] dark:bg-[var(--muted)] shadow-[2.5px_2.5px_0_0_#000] rounded-[6px]"
                      >
                        <div className="flex justify-between items-center mb-2.5 pb-1 border-b border-black/20 dark:border-white/20">
                          <span className="text-sm font-black uppercase text-black dark:text-white flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Record Repayment</span>
                          </span>
                          <button
                            onClick={() => setActivePaymentRecordId(null)}
                            className="w-5 h-5 border border-black bg-white dark:bg-[var(--card)] text-black dark:text-white text-xs font-bold flex items-center justify-center hover:bg-gray-200 rounded-[3px]"
                          >
                            ✕
                          </button>
                        </div>

                        {paymentError && (
                          <div className="p-2 border border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] dark:text-[#FDA4AF] text-xs font-bold mb-2 rounded-[4px]">
                            ⚠️ {paymentError}
                          </div>
                        )}

                        <form onSubmit={(e) => handleRecordPayment(e, record.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Amount (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              max={remaining}
                              required
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder={`Max ₹${remaining}`}
                              className="w-full h-10 px-2.5 border-[1.5px] border-black bg-white dark:bg-[var(--card)] text-sm font-bold text-black dark:text-white focus:bg-[#FEF08A] focus:text-black outline-none rounded-[4px]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Payment Date
                            </label>
                            <input
                              type="date"
                              required
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              className="w-full h-10 px-2 border-[1.5px] border-black bg-white dark:bg-[var(--card)] text-sm font-bold text-black dark:text-white outline-none rounded-[4px]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Note (Optional)
                            </label>
                            <input
                              type="text"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              placeholder="e.g. Part payment"
                              className="w-full h-10 px-2.5 border-[1.5px] border-black bg-white dark:bg-[var(--card)] text-sm font-bold text-black dark:text-white outline-none rounded-[4px]"
                            />
                          </div>

                          <div className="sm:col-span-3 flex justify-end gap-2 pt-1.5">
                            <button
                              type="button"
                              onClick={() => setActivePaymentRecordId(null)}
                              className="px-3 py-1 border border-black bg-white dark:bg-[var(--card)] text-black dark:text-white text-xs font-bold cursor-pointer hover:bg-gray-100 rounded-[4px]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isRecordingPayment}
                              className="px-4 py-1 border-[2px] border-black bg-[#2DD4BF] text-black text-xs font-black shadow-[2px_2px_0_0_#000] hover:bg-teal-300 cursor-pointer disabled:opacity-60 rounded-[4px]"
                            >
                              {isRecordingPayment ? "Saving..." : "Save Payment"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Repayment History */}
                  <AnimatePresence>
                    {isExpanded && record.payments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.16 }}
                        className="mt-3 p-3 border-[1.5px] border-black/20 dark:border-white/20 bg-[#FAF8F5] dark:bg-[var(--muted)] space-y-2 rounded-[6px]"
                      >
                        <p className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Payment Audit Trail ({record.payments.length})
                        </p>
                        <div className="space-y-1.5">
                          {record.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2 border border-black/15 dark:border-white/15 bg-white dark:bg-[var(--card)] text-sm rounded-[4px]"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#059669] dark:text-[#2DD4BF]">{formatMoney(p.amount)}</span>
                                <span className="text-gray-400 text-xs">· {formatDate(p.payment_date)}</span>
                                {p.note && <span className="text-gray-600 dark:text-gray-300 text-xs italic">({p.note})</span>}
                              </div>
                              <button
                                onClick={() => handleDeletePayment(p.id, record.id)}
                                className="text-gray-400 hover:text-[#F43F5E] p-1 transition-colors cursor-pointer"
                                title="Delete payment log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
