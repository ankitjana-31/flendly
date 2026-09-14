"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { RetroWindow } from "@/components/ui/retro-window";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";
import { formatDateTime } from "@/lib/format";
import { Bell, CheckCheck, Sparkles, Clock } from "lucide-react";

const LABELS: Record<NotificationItem["type"], string> = {
  new_request: "Sent you a new lending request",
  counter_offer: "Submitted a counter-offer",
  offer_accepted: "Accepted your proposal",
  offer_declined: "Declined the proposal",
  payment_recorded: "Logged a payment receipt",
  deadline_reminder: "Payment due date approaching",
  overdue: "Payment is past due date",
  fully_paid: "Loan deal fully settled & cleared",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

export function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
            <span>[REALTIME_LOGS]</span>
            <span className="text-gray-400">//</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">SYSTEM NOTIFICATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Activity & Notifications
          </h1>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(async () => { await markAllNotificationsReadAction(); router.refresh(); })}
            className="flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-[#059669]" />
            <span>MARK ALL AS READ</span>
          </Button>
        )}
      </div>

      {/* Main Window */}
      <RetroWindow
        title="NOTIFICATIONS // AUDIT STREAM"
        subtitle={`${unreadCount} unread items`}
        colorBar="yellow"
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className="px-2.5 py-0.5 border border-black bg-black text-white font-mono text-[11px] font-black uppercase">
            {unreadCount > 0 ? `${unreadCount} NEW` : "ALL READ"}
          </span>
        }
      >
        {notifications.length === 0 ? (
          <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-10 text-center bg-[#FAF8F5] dark:bg-[#1E212D]">
            <div className="w-10 h-10 border-[2px] border-black bg-[#FFE600] flex items-center justify-center mx-auto mb-3 font-bold text-black">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-mono text-base font-bold text-black dark:text-white uppercase">
              You&apos;re completely caught up
            </h3>
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Any new requests, approvals, or payments from your peer network will appear right here in real time.
            </p>
          </div>
        ) : (
          <motion.div
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            <AnimatePresence>
              {notifications.map((n) => {
                const isUnread = !n.read_at;
                return (
                  <motion.div
                    key={n.id}
                    variants={shouldReduceMotion ? undefined : itemVariants}
                    layout={!shouldReduceMotion}
                  >
                    <button
                      className="w-full text-left cursor-pointer group"
                      onClick={() =>
                        startTransition(async () => {
                          const { href } = await markNotificationReadAction(n);
                          router.push(href);
                        })
                      }
                    >
                      <div
                        className={`flex items-start sm:items-center justify-between gap-4 p-4 border-[2px] border-black dark:border-white/40 transition-all font-mono shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0.5 ${
                          isUnread
                            ? "bg-[#FFE600]/20 dark:bg-[#2E2800] border-l-[6px] border-l-[#2563EB]"
                            : "bg-[#FAF8F5] dark:bg-[#1E212D]"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-8 h-8 border border-black flex items-center justify-center text-xs font-bold shrink-0 ${
                            isUnread ? "bg-[#2563EB] text-white" : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-bold text-black dark:text-white">
                              {LABELS[n.type]}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(n.created_at)}
                            </p>
                          </div>
                        </div>

                        {isUnread && (
                          <span className="px-2 py-0.5 border border-black bg-[#2563EB] text-white font-mono text-[10px] font-black uppercase shrink-0">
                            UNREAD
                          </span>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </RetroWindow>
    </div>
  );
}
