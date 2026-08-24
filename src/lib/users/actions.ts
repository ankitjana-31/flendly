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

  // 1. Try standard RPC with p_new_username
  let rpcRes = await supabase.rpc("update_username", {
    p_new_username: newUsername,
  });

  // If fullName provided, update full_name via update_profile_details RPC or direct
  if (fullName) {
    await supabase.rpc("update_profile_details", {
      p_full_name: fullName,
      p_phone_number: null,
    });
  }

  // 2. Try alternative RPC param name if PostgREST signature mismatch
  if (rpcRes.error && (rpcRes.error.message.includes("schema cache") || rpcRes.error.code === "PGRST202")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpcRes = await (supabase.rpc as any)("update_username", {
      new_username: newUsername,
    });
  }

  // 3. Fallback to direct profiles table update/upsert if RPC is missing in remote database schema cache
  if (rpcRes.error && (rpcRes.error.message.includes("schema cache") || rpcRes.error.code === "PGRST202")) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("username, username_changed_count")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr && !profileErr.message.includes("schema cache")) {
      return { error: profileErr.message };
    }

    if (!profile) {
      // Profile row missing — upsert profile row directly
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

    if (profile.username === newUsername) {
      if (fullName) {
        await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      }
      return {};
    }

    const isFirstPick = Boolean(profile.username?.match(/^user_[0-9a-f]{8}$/));

    if (!isFirstPick && (profile.username_changed_count ?? 0) >= 1) {
      return { error: "Username can only be changed once." };
    }

    const updateData: {
      username: string;
      username_changed_count: number;
      updated_at: string;
      full_name?: string;
    } = {
      username: newUsername,
      username_changed_count: isFirstPick
        ? profile.username_changed_count
        : (profile.username_changed_count ?? 0) + 1,
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

  if (rpcRes.error) {
    if (rpcRes.error.code === "23505" || rpcRes.error.message.toLowerCase().includes("duplicate")) {
      return { error: "That username is already taken." };
    }
    return { error: rpcRes.error.message };
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


