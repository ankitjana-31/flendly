import { redirect } from "next/navigation";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { getVisibleProfile } from "@/lib/users/queries";
import { AuthedShell } from "@/components/layout/authed-shell";
import { NewRequestForm } from "@/components/requests/new-request-form";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ recipientId?: string }>;
}

export default async function NewRequestPage({ searchParams }: PageProps) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  // Fetch unread notifications count
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  const unreadCount = count ?? 0;

  const { recipientId } = await searchParams;
  let initialRecipient = null;

  if (recipientId) {
    initialRecipient = await getVisibleProfile(recipientId);
  }

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Create Agreement
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Configure borrowing or lending parameters and propose terms to a peer.
          </p>
        </div>

        <NewRequestForm initialRecipient={initialRecipient} />
      </div>
    </AuthedShell>
  );
}
