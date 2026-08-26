"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, {
    message:
      "Use 3-20 characters: lowercase letters, numbers, and underscores.",
  });

export type UsernameFormState = {
  error?: string;
  success?: boolean;
};

async function executeUsernameUpdate(
  newUsername: string,
  fullName?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, username, username_changed_count")
    .eq("id", user.id)
    .maybeSingle();

  // If profile doesn't exist yet (e.g. trigger hasn't fired or fresh user), auto-create row directly
  if (!existingProfile) {
    const { error: upsertErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      username: newUsername,
      full_name: fullName ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      username_changed_count: 0,
    });

    if (upsertErr) {
      if (upsertErr.code === "23505" || upsertErr.message.toLowerCase().includes("duplicate")) {
        return { error: "That username is already taken." };
      }
      return { error: upsertErr.message };
    }

    await supabase.from("privacy_settings").upsert({ user_id: user.id });
    return {};
  }

  // Profile exists — call update_username RPC
  const { error: rpcResError } = await supabase.rpc("update_username", {
    p_new_username: newUsername,
  });

  if (fullName) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  }

  if (rpcResError) {
    // If RPC failed or threw profile not found / schema cache error, fall back to direct update
    if (
      rpcResError.message.includes("profile not found") ||
      rpcResError.message.includes("schema cache") ||
      rpcResError.code === "PGRST202"
    ) {
      const isFirstPick = Boolean(existingProfile.username?.match(/^user_[0-9a-f]{8}$/));

      if (!isFirstPick && (existingProfile.username_changed_count ?? 0) >= 1) {
        return { error: "Username can only be changed once." };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        username: newUsername,
        username_changed_count: isFirstPick
          ? existingProfile.username_changed_count
          : (existingProfile.username_changed_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      };
      if (fullName) updateData.full_name = fullName;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (updateErr) {
        if (updateErr.code === "23505" || updateErr.message.toLowerCase().includes("duplicate")) {
          return { error: "That username is already taken." };
        }
        return { error: updateErr.message };
      }

      return {};
    }

    if (rpcResError.code === "23505" || rpcResError.message.toLowerCase().includes("duplicate")) {
      return { error: "That username is already taken." };
    }
    return { error: rpcResError.message };
  }

  return {};
}

export async function completeUsername(
  _state: UsernameFormState,
  formData: FormData,
): Promise<UsernameFormState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));
  const fullName = String(formData.get("fullName") ?? "").trim() || undefined;

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }

  const result = await executeUsernameUpdate(parsed.data, fullName);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateUsernameAction(
  _state: UsernameFormState,
  formData: FormData,
): Promise<UsernameFormState> {
  const parsed = usernameSchema.safeParse(formData.get("username"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }

  const result = await executeUsernameUpdate(parsed.data);
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export type ProfileFormState = {
  error?: string;
  success?: boolean;
};

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone_number: phoneNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export type PrivacyFormState = {
  error?: string;
  success?: boolean;
};

export async function updatePrivacy(
  _state: PrivacyFormState,
  formData: FormData,
): Promise<PrivacyFormState> {
  const avatarVisibility = formData.get("avatarVisibility") as any;
  const emailVisibility = formData.get("emailVisibility") as any;
  const phoneVisibility = formData.get("phoneVisibility") as any;

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("privacy_settings")
    .update({
      avatar_visibility: avatarVisibility,
      email_visibility: emailVisibility,
      phone_visibility: phoneVisibility,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeUsername(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const username = formData.get("username") as string;
  const parsed = usernameSchema.safeParse(username);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid username." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_username", {
    p_new_username: parsed.data,
  });

  if (error) {
    if (
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate")
    ) {
      return { error: "That username is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}


