"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown } from "lucide-react";
import { createSelfTrack, addSelfTrackPayment } from "@/lib/self-track/actions";
import { Card, LinkButton } from "@/components/ui/button";

export interface SelfTrackFormProps {
  onSuccess?: () => void;
}

export function SelfTrackForm({ onSuccess }: SelfTrackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"lent" | "borrowed">("lent");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!personName.trim()) {
        throw new Error("Person name is required");
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
      setIsOpen(false);

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Personal Record
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="flex gap-3">
                  {(["lent", "borrowed"] as const).map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        type === t
                          ? t === "lent"
                            ? "bg-success text-white"
                            : "bg-danger text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t === "lent" ? "I Lent" : "I Borrowed"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Person name */}
              <div>
                <label htmlFor="person-name" className="block text-sm font-medium mb-2">
                  Person Name
                </label>
                <input
                  id="person-name"
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Who did you lend to / borrow from?"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="record-date" className="block text-sm font-medium mb-2">
                  Date
                </label>
                <input
                  id="record-date"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium mb-2">
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional details..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Adding..." : "Add Record"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
