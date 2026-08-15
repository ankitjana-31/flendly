import { redirect } from "next/navigation";

import { Card, LinkButton } from "@/components/ui/button";
import { LoanListCard } from "@/components/loans/loan-list-card";
import { getCurrentUserProfile } from "@/lib/auth/queries";
import { listLoans } from "@/lib/loans/queries";

export default async function BorrowedPage() {
  const { user } = await getCurrentUserProfile();
  if (!user) redirect("/auth/login");

  const loans = await listLoans(user.id, "borrower");
  const active = loans.filter((l) => l.status === "ACTIVE");
  const paid = loans.filter((l) => l.status === "PAID");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Money you&apos;ve borrowed</h1>
        <LinkButton href="/requests/new" size="sm">
          New request
        </LinkButton>
      </div>

      {loans.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t borrowed anything yet.
        </Card>
      ) : (
        <>
          {active.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Active</h2>
              {active.map((loan) => (
                <LoanListCard key={loan.id} loan={loan} />
              ))}
            </section>
          )}
          {paid.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Paid off</h2>
              {paid.map((loan) => (
                <LoanListCard key={loan.id} loan={loan} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
