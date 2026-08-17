import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database.types";

/**
 * Service-role Supabase client. Bypasses RLS entirely — this must NEVER be
 * imported by a client component, a Server Component that renders
 * user-facing data, or anything reachable from the browser bundle.
 *
 * The `server-only` import above makes any accidental client-side import
 * of this module a build-time error, not just a code-review concern.
 *
 * Current sole caller: /api/cron/deadline-reminders, which is itself
 * gated behind CRON_SECRET and only ever invokes send_deadline_reminders() —
 * a single, narrow, already-hardened RPC — never arbitrary queries.
 */
export function createAdminClient() {
  if (!env.supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This is required for scheduled jobs " +
        "(deadline reminders) but must never be set as a NEXT_PUBLIC_* variable.",
    );
  }

  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
