"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  History, 
  IndianRupee, 
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { SelfTrackWithPayments } from "@/lib/types/self-track";
import { formatMoney, formatDate } from "@/lib/format";
import { updateSelfTrackStatus, deleteSelfTrack, deleteSelfTrackPayment, addSelfTrackPayment } from "@/lib/self-track/actions";

export interface SelfTrackListProps {
  records: SelfTrackWithPayments[];
  onRecordDeleted?: () => void;
}

export function SelfTrackList({ records, onRecordDeleted }: SelfTrackListProps) {
  const [filter, setFilter] = useState<"all" | "lent" | "borrowed" | "active" | "settled">("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Payment recording state
  const [activePaymentRecordId, setActivePaymentRecordId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleToggleStatus = async (recordId: string, currentStatus: string) => {
    setIsUpdating(recordId);
    try {
      const newStatus = currentStatus === "active" ? "settled" : "active";
      const res = await updateSelfTrackStatus(recordId, newStatus as "active" | "settled");
      if (res.success) {
        onRecordDeleted?.();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this private record?")) return;
    setIsDeleting(recordId);
    try {
      const res = await deleteSelfTrack(recordId);
      if (res.success) {
        onRecordDeleted?.();
      } else {
        alert(res.error || "Failed to delete record");
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    setPaymentError(null);

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      setPaymentError("Payment amount must be greater than 0");
      return;
    }

    setIsRecordingPayment(true);

    try {
      const res = await addSelfTrackPayment({
        self_track_id: recordId,
        amount: amt,
        payment_date: paymentDate,
        note: paymentNote.trim() || undefined,
      });

      if (!res.success) {
        setPaymentError(res.error || "Failed to record payment");
        return;
      }

      setPaymentAmount("");
      setPaymentNote("");
      setActivePaymentRecordId(null);
      onRecordDeleted?.();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string, recordId: string) => {
    try {
      const res = await deleteSelfTrackPayment(paymentId, recordId);
      if (res.success) {
        onRecordDeleted?.();
      } else {
        alert(res.error || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Failed to delete payment:", error);
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
    <div className="space-y-4 font-mono">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-black/10 dark:border-white/10">
        {[
          { id: "all", label: `ALL [${records.length}]` },
          { id: "lent", label: `LENT [${records.filter(r => r.type === "lent").length}]` },
          { id: "borrowed", label: `BORROWED [${records.filter(r => r.type === "borrowed").length}]` },
          { id: "active", label: `ACTIVE [${records.filter(r => r.status === "active").length}]` },
          { id: "settled", label: `SETTLED [${records.filter(r => r.status === "settled").length}]` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1 text-xs font-bold uppercase transition-all border-[2px] border-black cursor-pointer ${
              filter === tab.id
                ? "bg-[#FFE600] text-black shadow-[2px_2px_0_0_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[#1E212D] text-gray-700 dark:text-gray-300 shadow-[1px_1px_0_0_#000000] hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="border-[2px] border-dashed border-black/40 dark:border-white/40 p-8 text-center bg-white dark:bg-[#161821] shadow-[3px_3px_0_0_#000]">
          <div className="w-10 h-10 border-[2px] border-black bg-[#FFE600] flex items-center justify-center mx-auto mb-3 text-black font-bold">
            ⚡
          </div>
          <h3 className="font-mono text-sm font-bold text-black dark:text-white uppercase">No records in this category</h3>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Use the form to add your first private record for cash or offline transactions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRecords.map((record) => {
            const isLent = record.type === "lent";
            const originalAmount = Number(record.amount);
            const totalPaid = record.payments.reduce((acc, p) => acc + Number(p.amount), 0);
            const remaining = Math.max(0, originalAmount - totalPaid);
            const progress = originalAmount > 0 ? Math.min(100, Math.round((totalPaid / originalAmount) * 100)) : 0;
            const isSettled = record.status === "settled" || remaining === 0;
            const isExpanded = expandedId === record.id;
            const isAddingPayment = activePaymentRecordId === record.id;

            return (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-[2.5px] border-black dark:border-white/60 bg-white dark:bg-[#161821] transition-all shadow-[4px_4px_0_0_#000000] ${
                  isSettled ? "opacity-85" : ""
                }`}
              >
                {/* Header Bar of Entry */}
                <div className={`px-4 py-2 border-b-[2px] border-black dark:border-white/40 flex items-center justify-between font-mono text-xs ${
                  isLent ? "bg-[#2DD4BF]/20 dark:bg-[#0B3D30]" : "bg-[#F43F5E]/15 dark:bg-[#3D0C1D]"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 border border-black font-bold text-[10px] uppercase ${
                      isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                    }`}>
                      {isLent ? "I LENT" : "I BORROWED"}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.record_date)}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 border border-black text-[10px] font-bold uppercase ${
                    isSettled ? "bg-[#10B981] text-black" : "bg-[#FFE600] text-black"
                  }`}>
                    {isSettled ? "SETTLED" : "ACTIVE"}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  {/* Person and Amount Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-mono text-base sm:text-lg font-black text-black dark:text-white">
                        {isLent ? "Lent to: " : "Borrowed from: "} 
                        <span className="bg-[#FFE600] text-black px-1.5 py-0.5 border border-black inline-block ml-1">
                          {record.person_name}
                        </span>
                      </h4>
                      {record.note && (
                        <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5 italic">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          {record.note}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-[10px] uppercase text-gray-500 block font-bold">Total Record</span>
                      <p className={`text-xl font-black ${isLent ? "text-[#059669] dark:text-[#2DD4BF]" : "text-[#F43F5E]"}`}>
                        {formatMoney(originalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="p-3 border-[2px] border-black/20 dark:border-white/20 bg-[#FAF8F5] dark:bg-[#1E212D] space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-600 dark:text-gray-400">Repayment: {progress}%</span>
                      <span className={remaining === 0 ? "text-[#059669] dark:text-[#2DD4BF]" : "text-black dark:text-white"}>
                        {remaining === 0 ? "Fully Repaid" : `${formatMoney(remaining)} Remaining`}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-800 border border-black h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                        className={`h-full ${isLent ? "bg-[#2DD4BF]" : "bg-[#F43F5E]"}`}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
                      <span>Total Paid: {formatMoney(totalPaid)}</span>
                      <span>{record.payments.length} installments logged</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      {!isSettled && (
                        <button
                          onClick={() => {
                            setActivePaymentRecordId(isAddingPayment ? null : record.id);
                            setPaymentAmount(remaining.toString());
                          }}
                          className="px-3 py-1 border-[2px] border-black bg-[#FFE600] text-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-yellow-300 cursor-pointer flex items-center gap-1"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>Record Repayment</span>
                        </button>
                      )}

                      {record.payments.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                          className="px-2.5 py-1 border-[2px] border-black bg-white dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-gray-100 cursor-pointer flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5 text-gray-500" />
                          <span>Log ({record.payments.length})</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(record.id, record.status)}
                        disabled={isUpdating === record.id}
                        className={`px-3 py-1 border-[2px] border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] cursor-pointer flex items-center gap-1 ${
                          isSettled
                            ? "bg-[#2DD4BF] text-black hover:bg-teal-300"
                            : "bg-white dark:bg-[#1E212D] text-black dark:text-white hover:bg-gray-100"
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
                        disabled={isDeleting === record.id}
                        className="p-1.5 border border-black bg-[#F43F5E] text-white shadow-[1px_1px_0_0_#000] hover:opacity-90 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                        className="mt-3 p-3.5 border-[2px] border-black bg-[#FAF8F5] dark:bg-[#1E212D] shadow-[3px_3px_0_0_#000]"
                      >
                        <div className="flex justify-between items-center mb-2.5 pb-1 border-b border-black/20 dark:border-white/20">
                          <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Record Installment Repayment</span>
                          </span>
                          <button
                            onClick={() => setActivePaymentRecordId(null)}
                            className="w-4 h-4 border border-black bg-white text-black text-[10px] font-bold flex items-center justify-center hover:bg-gray-200"
                          >
                            ✕
                          </button>
                        </div>

                        {paymentError && (
                          <div className="p-2 border border-[#F43F5E] bg-[#FF2E93]/15 text-[#9F1239] text-xs font-bold mb-2">
                            ⚠️ {paymentError}
                          </div>
                        )}

                        <form onSubmit={(e) => handleRecordPayment(e, record.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 block mb-1 uppercase">
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
                              className="w-full h-8 px-2.5 border-[1.5px] border-black bg-white dark:bg-[#161821] text-xs font-bold focus:bg-[#FEF08A] focus:text-black"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 block mb-1 uppercase">
                              Payment Date
                            </label>
                            <input
                              type="date"
                              required
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              className="w-full h-8 px-2 border-[1.5px] border-black bg-white dark:bg-[#161821] text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300 block mb-1 uppercase">
                              Note (Optional)
                            </label>
                            <input
                              type="text"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              placeholder="e.g. UPI transfer"
                              className="w-full h-8 px-2.5 border-[1.5px] border-black bg-white dark:bg-[#161821] text-xs font-bold"
                            />
                          </div>

                          <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActivePaymentRecordId(null)}
                              className="px-3 py-1 border border-black bg-white text-black text-xs font-bold"
                            >
                              CANCEL
                            </button>
                            <button
                              type="submit"
                              disabled={isRecordingPayment}
                              className="px-4 py-1 border-[2px] border-black bg-[#2DD4BF] text-black text-xs font-black shadow-[2px_2px_0_0_#000] hover:bg-teal-300"
                            >
                              {isRecordingPayment ? "SAVING..." : "COMMIT PAYMENT"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Repayment History List */}
                  <AnimatePresence>
                    {isExpanded && record.payments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 border-[2px] border-black/20 dark:border-white/20 bg-[#FAF8F5] dark:bg-[#1E212D] space-y-2"
                      >
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                          PAYMENT AUDIT TRAIL ({record.payments.length})
                        </p>
                        <div className="space-y-1">
                          {record.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#161821] text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#059669] dark:text-[#2DD4BF]">{formatMoney(p.amount)}</span>
                                <span className="text-gray-500">· {formatDate(p.payment_date)}</span>
                                {p.note && <span className="text-gray-700 dark:text-gray-300 italic">({p.note})</span>}
                              </div>
                              <button
                                onClick={() => handleDeletePayment(p.id, record.id)}
                                className="text-gray-400 hover:text-[#F43F5E] p-1"
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

