import { redirect } from "next/navigation";

import { NotificationsList } from "@/components/notifications/notifications-list";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listNotifications } from "@/lib/notifications/queries";

export default async function NotificationsPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const notifications = await listNotifications();
  return <NotificationsList notifications={notifications} />;
}
