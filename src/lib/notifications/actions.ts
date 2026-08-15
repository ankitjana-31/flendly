"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notificationHref, type NotificationItem } from "@/lib/notifications/queries";

export async function markNotificationReadAction(notification: NotificationItem) {
  const supabase = await createClient();

  if (!notification.read_at) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification.id);

    revalidatePath("/notifications");
    revalidatePath("/dashboard");
  }

  return { href: notificationHref(notification) };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
