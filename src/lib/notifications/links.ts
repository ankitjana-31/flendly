import type { NotificationItem } from "@/lib/notifications/queries";

export function notificationHref(n: NotificationItem): string {
  const payload = n.payload as { loan_id?: string; request_id?: string };
  if (payload.loan_id) return `/loans/${payload.loan_id}`;
  if (payload.request_id) return `/requests/${payload.request_id}`;
  return "/notifications";
}