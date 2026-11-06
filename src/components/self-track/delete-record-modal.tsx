"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Calendar, IndianRupee, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Generic Retro Delete Modal                                         */
/* ------------------------------------------------------------------ */

export interface DeleteRecordInfo {
  personName: string;
  amount: string | number;
  type: "lent" | "borrowed";
  recordDate: string;
  status: "active" | "settled";
}

export interface DeleteRecordModalProps {
  isOpen: boolean;
  record: DeleteRecordInfo | null;
  isPending: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteRecordModal({
  isOpen,
  record,
  isPending,
  error,
  onConfirm,
  onClose,
}: DeleteRecordModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current && !isPending) onClose();
    },
    [isPending, onClose],
  );

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!record) return null;

  const isLent = record.type === "lent";
  const isSettled = record.status === "settled";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs font-mono"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="w-full max-w-[26rem] mx-3 mb-3 sm:mb-0 sm:mx-0 rounded-[12px] border-[2.5px] border-black bg-[var(--card)] shadow-[6px_6px_0_0_#000] overflow-hidden"
          >
            {/* ── Retro Title Bar ── */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b-[2px] border-black bg-[#F43F5E]">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span>Delete Record</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="w-5 h-5 flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Content Body ── */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Title + Description */}
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-base sm:text-lg font-black text-[var(--foreground)] font-sans"
                >
                  Delete this record?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed font-sans">
                  This private record and its repayment history will be permanently deleted.
                </p>
              </div>

              {/* ── Record Summary Card ── */}
              <div className="border-[1.5px] border-black/25 dark:border-white/20 rounded-[8px] overflow-hidden bg-[var(--muted)]">
                {/* Direction + Date strip */}
                <div
                  className={`px-3 py-2 border-b border-black/15 dark:border-white/15 flex items-center justify-between ${
                    isLent
                      ? "bg-[#2DD4BF]/15 dark:bg-[#0B3D30]/60"
                      : "bg-[#F43F5E]/10 dark:bg-[#3D0C1D]/60"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-black font-black text-xs uppercase tracking-wide ${
                      isLent ? "bg-[#2DD4BF] text-black" : "bg-[#F43F5E] text-white"
                    }`}
                  >
                    {isLent ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />I Lent
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />I Borrowed
                      </>
                    )}
                  </span>

                  <span className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.recordDate)}
                  </span>
                </div>

                {/* Person + Amount + Status */}
                <div className="px-3 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[var(--foreground)] truncate">
                      {record.personName}
                    </p>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded-[3px] border border-black/40 dark:border-white/30 text-[10px] font-black uppercase ${
                        isSettled
                          ? "bg-[#10B981]/20 text-[#059669] dark:text-[#2DD4BF]"
                          : "bg-[#FFE600]/20 text-[#92400E] dark:text-[#FFE600]"
                      }`}
                    >
                      {isSettled ? "Settled" : "Active"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-base sm:text-lg font-black shrink-0">
                    <IndianRupee
                      className={`w-4 h-4 ${
                        isLent
                          ? "text-[#059669] dark:text-[#2DD4BF]"
                          : "text-[#F43F5E] dark:text-[#FB7185]"
                      }`}
                    />
                    <span
                      className={
                        isLent
                          ? "text-[#059669] dark:text-[#2DD4BF]"
                          : "text-[#F43F5E] dark:text-[#FB7185]"
                      }
                    >
                      {formatMoney(record.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Error Message ── */}
              {error && (
                <div className="p-2.5 border-[1.5px] border-[#F43F5E] bg-[#F43F5E]/10 rounded-[6px] text-xs font-bold text-[#9F1239] dark:text-[#FDA4AF]">
                  ⚠️ {error}
                </div>
              )}

              {/* ── Action Buttons ── */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="h-10 sm:h-9 px-4 sm:px-3.5 rounded-[8px] border-[2px] border-black bg-[var(--card)] text-[var(--foreground)] font-mono text-sm sm:text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-[var(--muted)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  Keep record
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className="h-10 sm:h-9 px-5 sm:px-4 rounded-[8px] border-[2px] border-black bg-[#F43F5E] text-white font-mono text-sm sm:text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-[#E11D48] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Smaller variant for deleting a single payment log                  */
/* ------------------------------------------------------------------ */

export interface DeletePaymentModalProps {
  isOpen: boolean;
  isPending: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeletePaymentModal({
  isOpen,
  isPending,
  error,
  onConfirm,
  onClose,
}: DeletePaymentModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current && !isPending) onClose();
    },
    [isPending, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs font-mono"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-payment-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="w-full max-w-sm mx-3 mb-3 sm:mb-0 sm:mx-0 rounded-[12px] border-[2.5px] border-black bg-[var(--card)] shadow-[6px_6px_0_0_#000] overflow-hidden"
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b-[2px] border-black bg-[#F43F5E]">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span>Delete Payment</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="w-5 h-5 flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <h2
                  id="delete-payment-title"
                  className="text-base font-black text-[var(--foreground)] font-sans"
                >
                  Delete this payment log?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed font-sans">
                  This payment entry will be permanently removed from the record&apos;s repayment history.
                </p>
              </div>

              {error && (
                <div className="p-2.5 border-[1.5px] border-[#F43F5E] bg-[#F43F5E]/10 rounded-[6px] text-xs font-bold text-[#9F1239] dark:text-[#FDA4AF]">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="h-10 sm:h-9 px-4 sm:px-3.5 rounded-[8px] border-[2px] border-black bg-[var(--card)] text-[var(--foreground)] font-mono text-sm sm:text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-[var(--muted)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className="h-10 sm:h-9 px-5 sm:px-4 rounded-[8px] border-[2px] border-black bg-[#F43F5E] text-white font-mono text-sm sm:text-xs font-black uppercase shadow-[2px_2px_0_0_#000] hover:bg-[#E11D48] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete payment"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
