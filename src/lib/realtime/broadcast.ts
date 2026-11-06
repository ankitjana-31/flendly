import { env } from "@/lib/env";

export type RealtimeSyncAction =
  | "REQUEST_CREATED"
  | "OFFER_COUNTERED"
  | "OFFER_ACCEPTED"
  | "REQUEST_DECLINED"
  | "REQUEST_CANCELLED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REJECTED"
  | "SELF_TRACK_CHANGED";

export interface RealtimeSyncPayload {
  action: RealtimeSyncAction;
  id?: string;
  sourceUserId?: string;
  timestamp?: number;
}

export interface BroadcastOptions {
  targetUserIds: string | string[];
  event?: string;
  action?: RealtimeSyncAction;
  entity?: string;
  entityId?: string;
  id?: string;
  sourceUserId?: string;
  timestamp?: number;
}

/**
 * Dispatches an instant, targeted synchronization signal via Supabase Realtime's
 * HTTP Broadcast endpoint directly to one or more user-specific live channels.
 *
 * This delivers sub-second (< 100ms) updates to the recipient's open browser session
 * without waiting for database CDC replication lags or being blocked by PostgreSQL
 * RLS subquery limitations.
 */
export async function broadcastRealtimeSync(
  targetsOrOptions: string | string[] | BroadcastOptions,
  legacyPayload?: RealtimeSyncPayload,
): Promise<void> {
  let targetUserIds: string | string[];
  let payload: Record<string, any>;

  if (typeof targetsOrOptions === "object" && !Array.isArray(targetsOrOptions)) {
    targetUserIds = targetsOrOptions.targetUserIds;
    payload = {
      action: targetsOrOptions.action ?? (targetsOrOptions.event as RealtimeSyncAction) ?? "REQUEST_CREATED",
      id: targetsOrOptions.id ?? targetsOrOptions.entityId,
      entity: targetsOrOptions.entity,
      sourceUserId: targetsOrOptions.sourceUserId,
      timestamp: targetsOrOptions.timestamp ?? Date.now(),
    };
  } else {
    targetUserIds = targetsOrOptions;
    payload = {
      ...(legacyPayload ?? { action: "REQUEST_CREATED" }),
      timestamp: legacyPayload?.timestamp ?? Date.now(),
    };
  }

  const ids = (Array.isArray(targetUserIds) ? targetUserIds : [targetUserIds]).filter(Boolean);
  if (ids.length === 0) return;

  const url = `${env.supabaseUrl}/realtime/v1/api/broadcast`;
  const key = env.supabasePublishableKey;

  const messages = ids.map((userId) => ({
    topic: `flendly_live_sync:${userId}`,
    event: "flendly_sync",
    payload,
  }));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      // Non-blocking timeout so server actions never hang
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok && res.status !== 202) {
      console.warn("[Realtime Broadcast] HTTP broadcast responded with status:", res.status);
    }
  } catch (err) {
    // Non-fatal error: Postgres database mutation has already succeeded
    console.warn("[Realtime Broadcast] Failed to send broadcast sync signal:", err);
  }
}
