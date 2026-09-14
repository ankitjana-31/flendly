import { redirect } from "next/navigation";
import Link from "next/link";
import { ChangeUsernameForm } from "@/components/users/change-username-form";
import { ProfileDetailsForm } from "@/components/users/profile-details-form";
import { PrivacySettingsForm } from "@/components/users/privacy-settings-form";
import { ThemeSettingsForm } from "@/components/users/theme-settings-form";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { createClient } from "@/lib/supabase/server";
import { RetroWindow } from "@/components/ui/retro-window";
import { ArrowLeft, Sliders, Moon, User, Shield } from "lucide-react";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-4 md:py-6 md:px-6 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-black bg-white dark:bg-[#1E212D] text-black dark:text-white font-mono text-xs font-bold shadow-[2px_2px_0_0_#000] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO PROFILE</span>
        </Link>
        <span className="font-mono text-xs font-bold text-gray-500">[CONFIGURATION]</span>
      </div>

      <RetroWindow
        title="SETTINGS // PREFERENCES"
        subtitle="USER CONFIGURATION"
        colorBar="blue"
        className="bg-white dark:bg-[#161821] border-[2.5px] border-black dark:border-white shadow-[5px_5px_0_0_#000000]"
        contentClassName="p-5 sm:p-6 space-y-6"
      >
        {/* Appearance / Theme Settings */}
        <div className="border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] p-4 sm:p-5 shadow-[3px_3px_0_0_#000] space-y-3">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <Moon className="w-4 h-4 text-[#2563EB]" />
            <h2 className="font-mono text-sm font-bold text-black dark:text-white uppercase">Appearance Mode</h2>
          </div>
          <p className="font-mono text-xs text-gray-600 dark:text-gray-300">
            Choose your preferred light or dark theme palette.
          </p>
          <ThemeSettingsForm />
        </div>

        {/* Username Settings */}
        <div className="border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] p-4 sm:p-5 shadow-[3px_3px_0_0_#000] space-y-3">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <User className="w-4 h-4 text-[#059669]" />
            <h2 className="font-mono text-sm font-bold text-black dark:text-white uppercase">Handle / Username</h2>
          </div>
          <ChangeUsernameForm
            currentUsername={profile?.username ?? ""}
            changesUsed={profile?.username_changed_count ?? 0}
          />
        </div>

        {/* Profile Details */}
        <div className="border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] p-4 sm:p-5 shadow-[3px_3px_0_0_#000] space-y-3">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <Sliders className="w-4 h-4 text-[#F43F5E]" />
            <h2 className="font-mono text-sm font-bold text-black dark:text-white uppercase">Your Details</h2>
          </div>
          <ProfileDetailsForm fullName={own?.full_name ?? null} phoneNumber={own?.phone_number ?? null} />
        </div>

        {/* Privacy Settings */}
        <div className="border-[2px] border-black dark:border-white/30 bg-[#FAF8F5] dark:bg-[#1E212D] p-4 sm:p-5 shadow-[3px_3px_0_0_#000] space-y-3">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h2 className="font-mono text-sm font-bold text-black dark:text-white uppercase">Privacy & Visibility</h2>
          </div>
          <PrivacySettingsForm
            avatarVisibility={privacy?.avatar_visibility ?? "participants"}
            emailVisibility={privacy?.email_visibility ?? "only_me"}
            phoneVisibility={privacy?.phone_visibility ?? "only_me"}
          />
        </div>
      </RetroWindow>
    </div>
  );
}
