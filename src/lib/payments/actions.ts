"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/format";

const paymentSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentDate: z
    .string()
    .refine((d) => d <= todayIso(), { message: "Payment date cannot be in the future." }),
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Authentication required." };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: payErr } = await (supabase.from("payments") as any).insert({
        loan_id: loanId,
        recorded_by: user.id,
        amount: String(amount),
        payment_date: paymentDate,
        note: note ?? null,
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
