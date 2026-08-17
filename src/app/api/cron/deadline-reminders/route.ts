import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Daily job: emits deadline_reminder / overdue notifications via the
 * database's send_deadline_reminders() RPC (see migration 0020).
 *
 * This is the fallback path for environments without pg_cron available —
 * point a Vercel Cron Job (or any scheduler that can hit an HTTPS URL) at
 * this route once a day. If pg_cron IS enabled on your Supabase project,
 * prefer calling send_deadline_reminders() directly from cron.schedule()
 * instead (see README → Supabase Setup) and you can ignore this route
 * entirely — it's additive, not required.
 *
 * Gated by CRON_SECRET (server-only env var) so this can't be triggered
 * by an arbitrary request; Vercel Cron sends this automatically as a
 * bearer token when CRON_SECRET is set in the project's environment.
 */
export async function GET(request: NextRequest) {
  if (!env.cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("send_deadline_reminders");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ ok: true, ...result });
}
