import Link from "next/link";

import { Card } from "@/components/ui/button";
import { StatusBadge, loanDisplayStatus } from "@/components/ui/status-badge";
import { formatMoney, formatDate, interestSummary } from "@/lib/format";
import type { LoanListItem } from "@/lib/loans/queries";

export function LoanListCard({ loan }: { loan: LoanListItem }) {
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {loan.counterparty.full_name ?? `@${loan.counterparty.username}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {interestSummary(loan)} · due {formatDate(loan.due_date)}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <p className="font-tabular text-base font-semibold">
            {formatMoney(loan.ledger?.outstanding ?? loan.principal_amount)}
          </p>
          <StatusBadge status={loanDisplayStatus(loan)} />
        </div>
      </Card>
    </Link>
  );
}
