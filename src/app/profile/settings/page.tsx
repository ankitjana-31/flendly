import { redirect } from "next/navigation";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/layout/authed-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { PrivacyForm } from "@/components/profile/privacy-form";

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/auth/login");
  }

  if (isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  const supabase = await createClient();

  // Fetch current privacy settings
  const { data: privacy, error: privacyError } = await supabase
    .from("privacy_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (privacyError || !privacy) {
    // If privacy settings row is missing, redirect or throw
    // Typically privacy_settings are bootstrapped by trigger on_auth_user_created.
    // If not, we fall back to sensible defaults.
    console.error("Error loading privacy settings:", privacyError);
  }

  // Fetch unread notifications count
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  const unreadCount = count ?? 0;

  const defaultPrivacy = privacy || {
    avatar_visibility: "participants" as const,
    email_visibility: "only_me" as const,
    phone_visibility: "only_me" as const,
  };

  return (
    <AuthedShell profile={profile} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your public profile information, email preferences, and privacy visibility levels.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {profile && <ProfileForm profile={profile as any} />}
          </div>
          <div>
            <PrivacyForm privacy={defaultPrivacy} />
          </div>
        </div>
      </div>
    </AuthedShell>
  );
}
