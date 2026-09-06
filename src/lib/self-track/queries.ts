"use server";

import { createClient } from "@/lib/supabase/server";
import { SelfTrackRecord, SelfTrackPayment, SelfTrackWithPayments, SelfTrackType, SelfTrackStatus } from "@/lib/types/self-track";

export async function listSelfTracks(userId: string): Promise<SelfTrackWithPayments[]> {
  const supabase = await createClient();

  const { data: records, error } = await supabase
    .from("self_track")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching self tracks:", error);
    return [];
  }

  const rows = (records ?? []) as unknown as any[];

  // Fetch payments for each record
  const withPayments = await Promise.all(
    rows.map(async (record) => {
      const { data: payments, error: paymentsError } = await supabase
        .from("self_track_payments")
        .select("*")
        .eq("self_track_id", record.id)
        .order("payment_date", { ascending: true });

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        return { ...record, payments: [], remaining: Number(record.amount) };
      }

      const paymentRecords = (payments ?? []) as unknown as any[];
      const totalPaid = paymentRecords.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Number(record.amount) - totalPaid;

      return {
        ...record,
        payments: paymentRecords,
        remaining,
      };
    })
  );

  return withPayments;
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
  const supabase = await createClient();

  const { data: records, error } = await supabase
    .from("self_track")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching stats:", error);
    return {
      totalLent: 0,
      totalBorrowed: 0,
      activeLent: 0,
      activeBorrowed: 0,
      settledCount: 0,
    };
  }

  const rows = (records ?? []) as unknown as any[];

  // Fetch all payments to calculate totals
  const allPayments: any[] = [];
  for (const record of rows) {
    const { data: payments } = await supabase
      .from("self_track_payments")
      .select("*")
      .eq("self_track_id", record.id);

    if (payments) {
      allPayments.push(...(payments as unknown as any[]));
    }
  }

  const paymentsByRecord = new Map<string, number>();
  allPayments.forEach((p) => {
    const current = paymentsByRecord.get(p.self_track_id) ?? 0;
    paymentsByRecord.set(p.self_track_id, current + Number(p.amount));
  });

  const stats = rows.reduce(
    (acc, record) => {
      const totalPaid = paymentsByRecord.get(record.id) ?? 0;
      const amount = Number(record.amount);
      const remaining = amount - totalPaid;

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

  return stats;
}
