"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { SelfTrackWithPayments } from "@/lib/types/self-track";
import { formatMoney, formatDate } from "@/lib/format";
import { Card, LinkButton } from "@/components/ui/button";
import { updateSelfTrackStatus, deleteSelfTrack, deleteSelfTrackPayment } from "@/lib/self-track/actions";
import { AnimatedContainer } from "@/components/ui/animated-container";

export interface SelfTrackListProps {
  records: SelfTrackWithPayments[];
  onRecordDeleted?: () => void;
}

export function SelfTrackList({ records, onRecordDeleted }: SelfTrackListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No personal tracking records yet. Start with the button above.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record, idx) => (
        <AnimatedContainer
          key={record.id}
          animation="fadeInUp"
          delay={idx * 0.05}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className={`p-4 transition-colors ${
              record.status === "settled" ? "bg-muted/30" : ""
            }`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {record.type === "lent" ? "Lent to" : "Borrowed from"} {record.person_name}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        record.type === "lent"
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      }`}>
                        {record.type === "lent" ? "Lent" : "Borrowed"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(record.record_date)}
                      {record.note && ` · ${record.note}`}
                    </p>
                  </div>
                  <p className={`font-tabular text-lg font-bold ${
                    record.type === "lent" ? "text-success" : "text-danger"
                  }`}>
                    {formatMoney(record.amount)}
                  </p>
                </div>

                {/* Payments section */}
                {record.payments.length > 0 && (
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Payments ({record.payments.length})
                    </p>
                    <div className="space-y-1 ml-2">
                      {record.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {formatDate(payment.payment_date)} · {formatMoney(payment.amount)}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteSelfTrackPayment(payment.id, record.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining amount */}
                {record.remaining > 0 && (
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-sm font-medium">
                      Remaining: <span className="font-tabular">{formatMoney(record.remaining)}</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleStatus(record.id, record.status)}
                    disabled={isUpdating === record.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {record.status === "active" ? (
                      <>
                        <Circle className="w-4 h-4" />
                        Mark as settled
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Settled
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(record.id)}
                    disabled={isDeleting === record.id}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatedContainer>
      ))}
    </div>
  );
}
