"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card, Button } from "@/components/ui/button";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";
import { formatDateTime } from "@/lib/format";

const LABELS: Record<NotificationItem["type"], string> = {
  new_request: "sent you a request",
  counter_offer: "sent a counter-offer",
  offer_accepted: "accepted your offer",
  offer_declined: "declined the offer",
  payment_recorded: "recorded a payment",
  deadline_reminder: "Payment due soon",
  overdue: "Payment overdue",
  fully_paid: "Loan fully paid off",
};

export function NotificationsList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read_at) && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(async () => { await markAllNotificationsReadAction(); router.refresh(); })}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              className="w-full text-left"
              onClick={() =>
                startTransition(async () => {
                  const { href } = await markNotificationReadAction(n);
                  router.push(href);
                })
              }
            >
              <Card
                className={`flex items-center justify-between p-4 transition-colors hover:bg-muted ${
                  !n.read_at ? "border-accent/40 bg-accent/5" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{LABELS[n.type]}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
                {!n.read_at && <span className="h-2 w-2 rounded-full bg-accent" />}
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
