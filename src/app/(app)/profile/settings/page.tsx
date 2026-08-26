import { redirect } from "next/navigation";

import { Card } from "@/components/ui/button";
import { ChangeUsernameForm } from "@/components/users/change-username-form";
import { ProfileDetailsForm } from "@/components/users/profile-details-form";
import { PrivacySettingsForm } from "@/components/users/privacy-settings-form";
import { ThemeSettingsForm } from "@/components/users/theme-settings-form";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileSettingsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const [{ data: privacy }, { data: details }] = await Promise.all([
    supabase
      .from("privacy_settings")
      .select("avatar_visibility, email_visibility, phone_visibility")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.rpc("get_profile_visible", { target_id: user.id }),
  ]);

  const own = Array.isArray(details) ? details[0] : details;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 md:px-8">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      {/* Appearance / Theme Settings */}
      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Appearance</h2>
        <p className="text-xs text-muted-foreground">Choose your preferred light or dark theme mode.</p>
        <ThemeSettingsForm />
      </Card>

      {/* Username Settings */}
      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Username</h2>
        <ChangeUsernameForm
          currentUsername={profile?.username ?? ""}
          changesUsed={profile?.username_changed_count ?? 0}
        />
      </Card>

      {/* Profile Details */}
      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Your details</h2>
        <ProfileDetailsForm fullName={own?.full_name ?? null} phoneNumber={own?.phone_number ?? null} />
      </Card>

      {/* Privacy Settings */}
      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold text-muted-foreground">Privacy</h2>
        <PrivacySettingsForm
          avatarVisibility={privacy?.avatar_visibility ?? "participants"}
          emailVisibility={privacy?.email_visibility ?? "only_me"}
          phoneVisibility={privacy?.phone_visibility ?? "only_me"}
        />
      </Card>
    </div>
  );
}
