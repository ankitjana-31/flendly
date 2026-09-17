"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/format";

const paymentSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentDate: z.string().min(1, "Payment date is required."),
  note: z.string().trim().max(500).optional(),
});

export type PaymentActionState = { error?: string; success?: boolean };

export async function recordPaymentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const parsed = paymentSchema.safeParse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment." };
  }

  const { loanId, amount, paymentDate, note } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  // Fetch loan and existing pending payments to prevent duplicate payments exceeding remaining balance
  const [{ data: ledgerRows }, { data: existingPayments }] = await Promise.all([
    supabase.rpc("get_loan_ledger", { p_loan_id: loanId }),
    supabase
      .from("payments")
      .select("amount, status")
      .eq("loan_id", loanId),
  ]);

  const ledger = Array.isArray(ledgerRows) ? ledgerRows[0] : ledgerRows;
  const totalOutstanding = Number(ledger?.outstanding ?? 0);

  const pendingSum = (existingPayments ?? [])
    .filter((p: { status?: string }) => p.status === "PENDING")
    .reduce((sum: number, p: { amount: string }) => sum + Number(p.amount), 0);

  const remainingAvailable = Math.max(0, totalOutstanding - pendingSum);

  if (totalOutstanding > 0 && pendingSum >= totalOutstanding) {
    return {
      error: `A payment of ₹${pendingSum.toFixed(2)} is already pending confirmation. You cannot submit another payment until it is confirmed or rejected by the lender.`,
    };
  }

  if (totalOutstanding > 0 && amount > remainingAvailable + 0.01) {
    return {
      error: `Amount exceeds maximum payable amount (₹${remainingAvailable.toFixed(2)} remaining after ₹${pendingSum.toFixed(2)} pending).`,
    };
  }

  const { error } = await supabase.rpc("record_payment", {
    p_loan_id: loanId,
    p_amount: amount,
    p_payment_date: paymentDate,
    p_note: note ?? null,
  });

  if (error) {
    if (
      error.message.includes("schema cache") ||
      error.code === "PGRST202" ||
      error.code === "PGRST205"
    ) {
      // Fallback direct insert
      const { error: payErr } = await (supabase.from("payments") as any).insert({
        loan_id: loanId,
        recorded_by: user.id,
        amount: String(amount),
        payment_date: paymentDate,
        note: note ?? null,
        status: "PENDING",
      });

      if (payErr) return { error: payErr.message };
    } else {
      return { error: error.message };
    }
  }

  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/lent");
  revalidatePath("/borrowed");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function confirmPaymentAction(paymentId: string, loanId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_payment", { p_payment_id: paymentId });

  if (error) return { error: error.message };

  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/lent");
  revalidatePath("/borrowed");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectPaymentAction(paymentId: string, loanId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_payment", { p_payment_id: paymentId });

  if (error) return { error: error.message };

  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/lent");
  revalidatePath("/borrowed");
  revalidatePath("/dashboard");
  return { success: true };
}
