"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface RetroConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "yellow";
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RetroConfirmModal({
  isOpen,
  title = "CONFIRM ACTION",
  message,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  variant = "danger",
  isPending = false,
  onConfirm,
  onClose,
}: RetroConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerBg = variant === "danger" ? "bg-[#F43F5E] text-white" : "bg-[#FFE600] text-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[12px] border-[2.5px] border-black bg-white dark:bg-[var(--card)] shadow-[6px_6px_0_0_#000] overflow-hidden transition-all scale-100"
      >
        {/* Retro Header Bar */}
        <div className={`flex items-center justify-between px-3.5 py-2 border-b-[2px] border-black ${headerBg}`}>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-5 h-5 flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white text-xs font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-2 rounded-[8px] border-[2px] border-black bg-white dark:bg-[var(--muted)] text-black dark:text-white font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-gray-100 dark:hover:bg-gray-800 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`px-4 py-2 rounded-[8px] border-[2px] border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50 ${
                variant === "danger"
                  ? "bg-[#F43F5E] text-white hover:bg-[#E11D48]"
                  : "bg-[#FFE600] text-black hover:bg-[#FACC15]"
              }`}
            >
              {isPending ? "PROCESSING..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
