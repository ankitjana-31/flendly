import { redirect } from "next/navigation";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const supabase = await createClient();

  // Fetch all notifications for the current user
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading notifications:", error);
  }

  // Count unread notifications for shell
  const unreadCount = (notifications || []).filter((n) => !n.read_at).length;

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Notifications Log
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Keep track of incoming requests, counter-offers, payment allocations, and deadlines.
          </p>
        </div>

        <NotificationsList notifications={(notifications || []) as any} />
      </div>
    </AuthedShell>
  );
}
