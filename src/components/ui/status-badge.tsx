type Status =
  | "PENDING"
  | "COUNTERED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "ACTIVE"
  | "SUPERSEDED"
  | "PAID"
  | "OVERDUE"
  | "PARTIALLY_PAID";

const STYLES: Record<Status, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/30",
  COUNTERED: "bg-accent/10 text-accent border-accent/30",
  ACCEPTED: "bg-success/10 text-success border-success/30",
  ACTIVE: "bg-accent/10 text-accent border-accent/30",
  DECLINED: "bg-danger/10 text-danger border-danger/30",
  CANCELLED: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  SUPERSEDED: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  PAID: "bg-success/10 text-success border-success/30",
  OVERDUE: "bg-danger/10 text-danger border-danger/30",
  PARTIALLY_PAID: "bg-warning/10 text-warning border-warning/30",
};

const LABELS: Record<Status, string> = {
  PENDING: "Pending",
  COUNTERED: "Countered",
  ACCEPTED: "Accepted",
  ACTIVE: "Active",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  SUPERSEDED: "Superseded",
  PAID: "Paid",
  OVERDUE: "Overdue",
  PARTIALLY_PAID: "Partially paid",
};

export function StatusBadge({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}

export function loanDisplayStatus(loan: {
  status: "ACTIVE" | "PAID";
  ledger?: { is_overdue: boolean; is_partially_paid: boolean } | null;
}): Status {
  if (loan.status === "PAID") return "PAID";
  if (loan.ledger?.is_overdue) return "OVERDUE";
  if (loan.ledger?.is_partially_paid) return "PARTIALLY_PAID";
  return "ACTIVE";
}
