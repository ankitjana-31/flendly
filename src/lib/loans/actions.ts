"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const paymentSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.number().positive("Amount must be greater than zero"),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  note: z.string().max(200).nullable().optional(),
});

export async function recordPaymentAction(formData: {
  loanId: string;
  amount: number;
  paymentDate: string;
  note?: string | null;
}) {
  const parsed = paymentSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment data." };
  }

  const supabase = await createClient();
  const { data: paymentId, error } = await supabase.rpc("record_payment", {
    p_loan_id: parsed.data.loanId,
    p_amount: parsed.data.amount,
    p_payment_date: parsed.data.paymentDate,
    p_note: parsed.data.note || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/loans/${parsed.data.loanId}`);
  return { success: true, paymentId };
}
export async function markNotificationReadAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

