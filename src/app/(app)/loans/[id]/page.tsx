import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/ui/button";
import { StatusBadge, loanDisplayStatus } from "@/components/ui/status-badge";
import { RecordPaymentSection } from "@/components/loans/record-payment-section";
import { PaymentConfirmActions } from "@/components/loans/payment-actions";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { getLoanDetail } from "@/lib/loans/queries";
import { formatMoney, formatDate, interestSummary } from "@/lib/format";
import type { LoanTerms, PaymentRecord } from "@/lib/interest/engine";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const loan = await getLoanDetail(id, user.id);
  if (!loan) notFound();
  if (loan.lender.id !== user.id && loan.borrower.id !== user.id) notFound();

  const terms: LoanTerms = {
    principalAmount: loan.principal_amount,
    interestType: loan.interest_type,
    interestRate: loan.interest_rate,
    interestFrequency: loan.interest_frequency,
    compounding: loan.compounding,
    startDate: loan.start_date,
    dueDate: loan.due_date,
    paidOffDate: loan.status === "PAID" ? loan.payments[loan.payments.length - 1]?.payment_date ?? null : null,
  };
  const existingPayments: PaymentRecord[] = loan.payments.map((p) => ({
    amount: p.amount,
    paymentDate: p.payment_date,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {loan.counterparty.full_name ?? `@${loan.counterparty.username}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {loan.viewerRole === "lender" ? "You lent" : "You borrowed"} · {interestSummary(loan)}
          </p>
        </div>
        <StatusBadge status={loanDisplayStatus(loan)} />
      </div>

      <Card className="grid grid-cols-3 divide-x divide-border p-0">
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Principal</p>
          <p className="mt-1 font-tabular text-lg font-semibold">{formatMoney(loan.ledger?.principal_remaining)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Interest</p>
          <p className="mt-1 font-tabular text-lg font-semibold">{formatMoney(loan.ledger?.unpaid_interest)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="mt-1 font-tabular text-lg font-semibold">{formatMoney(loan.ledger?.outstanding)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Started</p>
          <p className="font-medium">{formatDate(loan.start_date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Due</p>
          <p className="font-medium">{formatDate(loan.due_date)}</p>
        </div>
      </div>

      {loan.status === "ACTIVE" && loan.viewerRole === "borrower" && (
        <RecordPaymentSection loanId={loan.id} terms={terms} existingPayments={existingPayments} />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Payment history</h2>
        {loan.payments.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No payments recorded yet.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {[...loan.payments].reverse().map((p) => {
              const status = p.status ?? "CONFIRMED";
              return (
                <Card key={p.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-tabular text-sm font-semibold">{formatMoney(p.amount)}</p>
                        {status === "PENDING" && (
                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            Pending Confirmation
                          </span>
                        )}
                        {status === "REJECTED" && (
                          <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                            Rejected
                          </span>
                        )}
                        {status === "CONFIRMED" && (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Confirmed
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(p.payment_date)} · interest {formatMoney(p.interest_component)} · principal{" "}
                        {formatMoney(p.principal_component)}
                        {Number(p.overpaid_excess) > 0 && ` · overpaid ${formatMoney(p.overpaid_excess)}`}
                      </p>
                      {p.note && <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>}
                    </div>
                  </div>
                  {status === "PENDING" && loan.viewerRole === "lender" && (
                    <PaymentConfirmActions paymentId={p.id} loanId={loan.id} />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
