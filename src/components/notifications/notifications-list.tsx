"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { Bell, CheckCheck, Clock, ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle2, AlertTriangle, ShieldCheck, LoaderCircle, X, type LucideIcon } from "lucide-react";

import { RetroWindow } from "@/components/ui/retro-window";
import { deleteNotificationAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications/actions";
import { notificationHref } from "@/lib/notifications/links";
import type { NotificationItem } from "@/lib/notifications/queries";
import { formatDateTime, formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  new_request: { label: "New Peer Proposal", icon: ArrowUpRight, color: "bg-[#FFE600] text-black" },
  counter_offer: { label: "Counter Proposal Submitted", icon: ArrowDownLeft, color: "bg-[#FFE600] text-black" },
  offer_accepted: { label: "Proposal Accepted & Loan Created", icon: CheckCircle2, color: "bg-[#2DD4BF] text-black" },
  offer_declined: { label: "Proposal Declined", icon: AlertTriangle, color: "bg-[#F43F5E] text-white" },
  payment_recorded: { label: "Repayment Receipt Logged", icon: Wallet, color: "bg-[#2DD4BF] text-black" },
  deadline_reminder: { label: "Upcoming Due Date Reminder", icon: Clock, color: "bg-[#FFE600] text-black" },
  overdue: { label: "Past Due Date Alert", icon: AlertTriangle, color: "bg-[#F43F5E] text-white" },
  fully_paid: { label: "Loan Fully Settled & Cleared", icon: ShieldCheck, color: "bg-[#2DD4BF] text-black" },
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

export function NotificationsList({ notifications: initialNotifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Sync state if server props change
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Realtime Supabase Channel Subscription for Live Notifications
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("live_notifications_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as NotificationItem;
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    // Fallback polling every 8 seconds for smooth background refresh
    const interval = setInterval(() => {
      router.refresh();
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [router]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = () => {
    // Instant optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  };

  const handleOpen = (notification: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
    );
    setOpeningId(notification.id);
    void markNotificationReadAction(notification);
    startTransition(() => {
      router.push(notificationHref(notification));
    });
  };

  const handleDelete = async (notificationId: string) => {
    const previous = notifications;
    setDeletingId(notificationId);
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));

    const result = await deleteNotificationAction(notificationId);
    if (result.error) setNotifications(previous);
    setDeletingId(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black/10 dark:border-white/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
            <span>[REALTIME_LOGS]</span>
            <span className="text-gray-400">{"//"}</span>
            <span className="text-gray-600 dark:text-gray-300 uppercase">SYSTEM NOTIFICATIONS</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#059669] animate-pulse ml-1" title="Realtime socket connected" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight mt-1">
            Activity & Notifications
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            disabled={isPending}
            onClick={handleMarkAllRead}
            className="px-4 py-2 border-[2px] border-black bg-white dark:bg-[var(--muted)] text-black dark:text-white font-mono text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0_0_#000] hover:bg-[#FFE600] hover:text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-2 transition-all"
          >
            <CheckCheck className="w-4 h-4 text-[#059669]" />
            <span>MARK ALL AS READ</span>
          </button>
        )}
      </div>

      {/* Main Window */}
      <RetroWindow
        title="NOTIFICATIONS // AUDIT STREAM"
        subtitle={`${unreadCount} unread items · live socket sync`}
        colorBar="yellow"
        glow={true}
        className="bg-white dark:bg-[var(--card)] border-[2.5px] border-black dark:border-white shadow-[6px_6px_0_0_#000000]"
        contentClassName="p-5 sm:p-6"
        headerRight={
          <span className={`px-2.5 py-0.5 border border-black font-mono text-[11px] font-black uppercase ${
            unreadCount > 0 ? "bg-[#FFE600] text-black" : "bg-black text-white"
          }`}>
            {unreadCount > 0 ? `${unreadCount} NEW` : "ALL READ"}
          </span>
        }
      >
        {notifications.length === 0 ? (
          <div className="border-[2px] border-dashed border-black/30 dark:border-white/30 p-10 text-center bg-[#FAF8F5] dark:bg-[var(--muted)]">
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
                const config = TYPE_CONFIG[n.type] ?? { label: "System Notification", icon: Bell, color: "bg-gray-200 text-black" };
                const IconComponent = config.icon;
                const payload = (n.payload ?? {}) as { direction?: string; amount?: string; sender_username?: string };
                const direction = payload.direction;

                return (
                  <motion.div
                    key={n.id}
                    variants={shouldReduceMotion ? undefined : itemVariants}
                    layout={!shouldReduceMotion}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-busy={openingId === n.id}
                      className="w-full text-left cursor-pointer group"
                      onClick={() => handleOpen(n)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleOpen(n);
                        }
                      }}
                    >
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-[2px] border-black dark:border-white/40 transition-all font-mono shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0.5 ${
                          isUnread
                            ? "bg-[#FFE600]/20 dark:bg-[#2E2800] border-l-[6px] border-l-[#2563EB]"
                            : "bg-[#FAF8F5] dark:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`w-9 h-9 border border-black flex items-center justify-center text-xs font-bold shrink-0 shadow-[1px_1px_0_0_#000] ${
                            isUnread ? "bg-[#2563EB] text-white" : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                          }`}>
                            <IconComponent className="w-4.5 h-4.5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm sm:text-base font-black text-black dark:text-white">
                                {config.label}
                              </p>
                              {direction && (
                                <span className={`px-1.5 py-0.2 border border-black text-[9px] font-black uppercase ${
                                  direction === "lend" ? "bg-[#FB7185] text-white" : "bg-[#FFE600] text-black"
                                }`}>
                                  {direction === "lend" ? "LENDING" : "BORROWING"}
                                </span>
                              )}
                              {payload.amount && (
                                <span className="text-xs font-black text-[#059669] dark:text-[#2DD4BF]">
                                  ({formatMoney(payload.amount)})
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(n.created_at)}
                              {payload.sender_username && (
                                <span>· from @{payload.sender_username}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isUnread && (
                            <span className="px-2 py-0.5 border border-black bg-[#2563EB] text-white font-mono text-[10px] font-black uppercase shrink-0 shadow-[1px_1px_0_0_#000]">
                              UNREAD
                            </span>
                          )}
                          <span className="text-xs font-bold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            {openingId === n.id ? (
                              <span className="inline-flex items-center gap-1 text-[#2563EB]">
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> OPENING...
                              </span>
                            ) : (
                              "VIEW →"
                            )}
                          </span>
                          <button
                            type="button"
                            aria-label="Delete notification"
                            title="Delete notification"
                            disabled={deletingId === n.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(n.id);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center border-[2px] border-black bg-[#F43F5E] text-white shadow-[1px_1px_0_0_#000] hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === n.id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
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
