import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  type:
    | "new_request"
    | "counter_offer"
    | "offer_accepted"
    | "offer_declined"
    | "payment_recorded"
    | "deadline_reminder"
    | "overdue"
    | "fully_paid";
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export function notificationHref(n: NotificationItem): string {
  const payload = n.payload as { loan_id?: string; request_id?: string };
  if (payload.loan_id) return `/loans/${payload.loan_id}`;
  if (payload.request_id) return `/requests/${payload.request_id}`;
  return "/notifications";
}

export async function listNotifications(limit = 50): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}
