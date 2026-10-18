"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient<Database>(
      env.supabaseUrl,
      env.supabasePublishableKey,
    );
  }
  if (!client) {
    client = createBrowserClient<Database>(
      env.supabaseUrl,
      env.supabasePublishableKey,
    );
  }
  return client;
}
