"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

async function getBaseUrl() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");

  if (host) {
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const protocol = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return env.siteUrl ?? "http://localhost:3000";
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/auth/login?error=Unable%20to%20start%20Google%20sign-in");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
