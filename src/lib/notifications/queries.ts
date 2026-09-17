import { createClient } from "@/lib/supabase/server";
import { notificationHref } from "@/lib/notifications/links";

export { notificationHref } from "@/lib/notifications/links";

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
