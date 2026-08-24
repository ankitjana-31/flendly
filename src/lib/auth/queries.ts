import { createClient } from "@/lib/supabase/server";

export function isPlaceholderUsername(username: string | null | undefined) {
  if (!username) return true;
  return Boolean(username.match(/^user_[0-9a-f]{8}$/));
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, username_changed_count, full_name, email, avatar_url, phone_number",
    )
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}
