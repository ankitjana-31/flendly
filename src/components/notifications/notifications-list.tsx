"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ShieldCheck,
  XCircle,
  Coins,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/loans/actions";

interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  payload: any;
  read_at: string | null;
  created_at: string;
}

interface NotificationsListProps {
  notifications: NotificationItem[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = async () => {
    if (pending || unreadCount === 0) return;
    setPending(true);
    await markAllNotificationsReadAction();
    setPending(false);
    router.refresh();
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    const payload = notif.payload || {};
    let href = "/dashboard";
    if (payload.loan_id) href = `/loans/${payload.loan_id}`;
    else if (payload.request_id) href = `/requests/${payload.request_id}`;

    if (!notif.read_at) {
      await markNotificationReadAction(notif.id);
    }
    router.push(href);
    router.refresh();
  };

  const getNotifConfig = (type: string) => {
    switch (type) {
      case "new_request":
        return {
          icon: MessageSquare,
          colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
          text: "New request proposal received",
        };
      case "counter_offer":
        return {
          icon: MessageSquare,
          colorClass: "text-amber-655 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
          text: "Counter-offer proposed",
        };
      case "offer_accepted":
        return {
          icon: ShieldCheck,
          colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
          text: "Loan agreement activated",
        };
      case "offer_declined":
        return {
          icon: XCircle,
          colorClass: "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400",
          text: "Proposal terms declined",
        };
      case "payment_recorded":
        return {
          icon: Coins,
          colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
          text: "Payment recorded successfully",
        };
      case "deadline_reminder":
        return {
          icon: Clock,
          colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
          text: "Repayment deadline approaching",
        };
      case "overdue":
        return {
          icon: AlertCircle,
          colorClass: "text-red-655 bg-red-50 dark:bg-red-950/20 dark:text-red-400",
          text: "Loan repayment is OVERDUE",
        };
      case "fully_paid":
        return {
          icon: Sparkles,
          colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
          text: "Agreement fully settled!",
        };
      default:
        return {
          icon: AlertCircle,
          colorClass: "text-zinc-600 bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400",
          text: "Account notification update",
        };
    }
  };

  const formatAmount = (payload: any) => {
    if (payload && payload.amount) {
      return `₹${parseFloat(payload.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-500 font-medium">
          {unreadCount === 0 ? "All caught up!" : `${unreadCount} unread notifications`}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications Stream */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1C23] border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl max-w-xl mx-auto space-y-3">
          <CheckCheck className="h-10 w-10 text-zinc-350 dark:text-zinc-600 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No notifications yet</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Events such as new loan requests, offers, and recorded payments will alert you here.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1C23] border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl divide-y divide-zinc-150 dark:divide-zinc-850/50 shadow-sm overflow-hidden">
          {notifications.map((notif) => {
            const config = getNotifConfig(notif.type);
            const IconComponent = config.icon;
            const amountText = formatAmount(notif.payload);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex gap-4 p-5 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all items-start relative ${
                  !notif.read_at ? "bg-zinc-50/20 dark:bg-zinc-800/10" : ""
                }`}
              >
                {/* Unread pulsing indicator left border */}
                {!notif.read_at && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md" />
                )}

                {/* Styled icon box */}
                <div className={`p-2 rounded-xl shrink-0 ${config.colorClass}`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                {/* Text details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {config.text}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 leading-snug">
                    {notif.type === "new_request" || notif.type === "counter_offer" || notif.type === "offer_accepted" || notif.type === "payment_recorded" ? (
                      <>
                        Amount: <span className="font-semibold font-mono text-zinc-700 dark:text-zinc-350">{amountText}</span>.
                      </>
                    ) : null}
                    {notif.payload?.message || notif.payload?.note ? (
                      <span className="block mt-1 italic text-zinc-400 dark:text-zinc-500">
                        &ldquo;{notif.payload.message || notif.payload.note}&rdquo;
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
