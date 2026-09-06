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
      await updateSelfTrackStatus(recordId, newStatus as "active" | "settled");
      onRecordDeleted?.();
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
      await deleteSelfTrack(recordId);
      onRecordDeleted?.();
    } catch (error) {
      console.error("Failed to delete record:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    setPaymentError(null);
    setIsRecordingPayment(true);

    try {
      const amt = Number(paymentAmount);
      if (!amt || amt <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      await addSelfTrackPayment({
        self_track_id: recordId,
        amount: amt,
        payment_date: paymentDate,
        note: paymentNote.trim() || undefined,
      });

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
      await deleteSelfTrackPayment(paymentId, recordId);
      onRecordDeleted?.();
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
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border/50">
        {[
          { id: "all", label: `All (${records.length})` },
          { id: "lent", label: `Lent (${records.filter(r => r.type === "lent").length})` },
          { id: "borrowed", label: `Borrowed (${records.filter(r => r.type === "borrowed").length})` },
          { id: "active", label: `Active (${records.filter(r => r.status === "active").length})` },
          { id: "settled", label: `Settled (${records.filter(r => r.status === "settled").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? "bg-foreground text-background shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-base font-bold text-foreground">No records in this view</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Use the form above to add your first private record for cash or offline transactions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
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
                className={`rounded-3xl border transition-all overflow-hidden ${
                  isSettled
                    ? "bg-card/40 border-border/60 opacity-80"
                    : isLent
                    ? "bg-card/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/5"
                    : "bg-card/90 border-rose-500/30 hover:border-rose-500/60 shadow-lg shadow-rose-500/5"
                }`}
              >
                <div className="p-5 sm:p-6">
                  {/* Top Bar: Badges and Amount */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isLent 
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                      }`}>
                        {isLent ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {isLent ? "I Lent" : "I Borrowed"}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isSettled
                          ? "bg-muted text-muted-foreground"
                          : "bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20"
                      }`}>
                        {isSettled ? "Settled" : "Active"}
                      </span>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.record_date)}
                      </span>
                    </div>

                    {/* Amount Block */}
                    <div className="text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Original Amount
                      </span>
                      <p className={`font-tabular text-xl sm:text-2xl font-black ${
                        isLent ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {formatMoney(originalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Person and Note */}
                  <div className="mt-3">
                    <h4 className="font-heading text-lg font-bold text-foreground">
                      {isLent ? "Lent to" : "Borrowed from"} <span className="underline decoration-dotted underline-offset-4">{record.person_name}</span>
                    </h4>
                    {record.note && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 italic">
                        <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        {record.note}
                      </p>
                    )}
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="mt-5 space-y-2 bg-muted/40 p-3.5 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Repayment Progress: {progress}%</span>
                      <span className={remaining === 0 ? "text-emerald-500 font-bold" : "text-foreground font-tabular"}>
                        {remaining === 0 ? "Fully Repaid" : `${formatMoney(remaining)} Remaining`}
                      </span>
                    </div>

                    <div className="w-full bg-border/60 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isLent
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-rose-500 to-amber-400"
                        }`}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Total Paid: {formatMoney(totalPaid)}</span>
                      <span>{record.payments.length} installments logged</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Add Repayment Button */}
                      {!isSettled && (
                        <button
                          onClick={() => {
                            setActivePaymentRecordId(isAddingPayment ? null : record.id);
                            setPaymentAmount(remaining.toString());
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          Record Repayment
                        </button>
                      )}

                      {/* Payment History Toggle */}
                      {record.payments.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                          className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <History className="w-3.5 h-3.5 text-muted-foreground" />
                          History ({record.payments.length})
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Settle Status */}
                      <button
                        onClick={() => handleToggleStatus(record.id, record.status)}
                        disabled={isUpdating === record.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSettled
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {isSettled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            Mark Settled
                          </>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={isDeleting === record.id}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
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
                        className="mt-4 pt-4 border-t border-teal-500/30 bg-teal-500/5 p-4 rounded-2xl"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">
                            Record Partial or Full Repayment
                          </span>
                          <button
                            onClick={() => setActivePaymentRecordId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {paymentError && (
                          <div className="p-2.5 rounded-xl bg-danger/10 text-danger text-xs mb-3">
                            {paymentError}
                          </div>
                        )}

                        <form onSubmit={(e) => handleRecordPayment(e, record.id)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              Repaid Amount (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              max={remaining}
                              required
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder={`Max ₹${remaining}`}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-bold font-tabular focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              Payment Date
                            </label>
                            <input
                              type="date"
                              required
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                              Note (Optional)
                            </label>
                            <input
                              type="text"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              placeholder="e.g. Paid via GPay"
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                            />
                          </div>

                          <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActivePaymentRecordId(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isRecordingPayment}
                              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 shadow-md shadow-teal-500/20"
                            >
                              {isRecordingPayment ? "Saving..." : "Save Payment"}
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
                        className="mt-4 pt-4 border-t border-border/50 space-y-2"
                      >
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Repayment History Log
                        </p>
                        <div className="space-y-1.5">
                          {record.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-500 font-tabular">{formatMoney(p.amount)}</span>
                                <span className="text-muted-foreground">· {formatDate(p.payment_date)}</span>
                                {p.note && <span className="text-foreground/80 italic">({p.note})</span>}
                              </div>
                              <button
                                onClick={() => handleDeletePayment(p.id, record.id)}
                                className="text-muted-foreground hover:text-danger p-1 rounded-lg transition-colors"
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
