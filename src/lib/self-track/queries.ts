"use server";

import { createClient } from "@/lib/supabase/server";
import { SelfTrackRecord, SelfTrackPayment, SelfTrackWithPayments, SelfTrackType, SelfTrackStatus } from "@/lib/types/self-track";

export async function listSelfTracks(userId: string): Promise<SelfTrackWithPayments[]> {
  const supabase = await createClient();

  const [{ data: records, error: recordsError }, { data: allPayments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("self_track")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("self_track_payments")
        .select("*")
        .order("payment_date", { ascending: true }),
    ]);

  if (recordsError) {
    console.error("Error fetching self tracks:", recordsError);
    return [];
  }

  if (paymentsError) {
    console.error("Error fetching self track payments:", paymentsError);
  }

  const paymentsByTrack = new Map<string, SelfTrackPayment[]>();
  for (const p of ((allPayments ?? []) as unknown as SelfTrackPayment[])) {
    const list = paymentsByTrack.get(p.self_track_id) ?? [];
    list.push(p);
    paymentsByTrack.set(p.self_track_id, list);
  }

  return ((records ?? []) as unknown as any[]).map((record) => {
    const payments = paymentsByTrack.get(record.id) ?? [];
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const amount = Number(record.amount || 0);
    const remaining = Math.max(0, amount - totalPaid);

    return {
      ...record,
      payments,
      remaining,
    };
  });
}

export async function getSelfTrackDetail(recordId: string, userId: string): Promise<SelfTrackWithPayments | null> {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("self_track")
    .select("*")
    .eq("id", recordId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !record) {
    if (error) console.error("Error fetching self track:", error);
    return null;
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("self_track_payments")
    .select("*")
    .eq("self_track_id", recordId)
    .order("payment_date", { ascending: true });

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
    return { ...(record as any), payments: [], remaining: Number((record as any).amount) };
  }

  const paymentRecords = (payments ?? []) as unknown as any[];
  const totalPaid = paymentRecords.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number((record as any).amount) - totalPaid;

  return {
    ...(record as any),
    payments: paymentRecords,
    remaining,
  };
}

export async function getSelfTrackStats(userId: string) {
  const records = await listSelfTracks(userId);

  return records.reduce(
    (acc, record) => {
      const amount = Number(record.amount || 0);
      const remaining = Number(record.remaining || 0);

      if (record.type === "lent") {
        acc.totalLent += amount;
        if (record.status === "active") acc.activeLent += remaining;
      } else {
        acc.totalBorrowed += amount;
        if (record.status === "active") acc.activeBorrowed += remaining;
      }

      if (record.status === "settled") acc.settledCount++;

      return acc;
    },
    { totalLent: 0, totalBorrowed: 0, activeLent: 0, activeBorrowed: 0, settledCount: 0 }
  );
}
