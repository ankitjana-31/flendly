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
  PENDING: "bg-[#FFE600] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  COUNTERED: "bg-[#C4B5FD] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  ACCEPTED: "bg-[#86EFAC] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  ACTIVE: "bg-[#2DD4BF] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  DECLINED: "bg-[#FDA4AF] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  CANCELLED: "bg-gray-200 dark:bg-gray-700 text-black dark:text-white border-black dark:border-white/30 font-bold",
  SUPERSEDED: "bg-gray-200 dark:bg-gray-700 text-black dark:text-white border-black dark:border-white/30 font-bold",
  PAID: "bg-[#86EFAC] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  OVERDUE: "bg-[#FDA4AF] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
  PARTIALLY_PAID: "bg-[#FDE047] text-black border-black shadow-[1px_1px_0_0_#000] font-black",
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
      className={`inline-flex items-center gap-1 rounded-[3px] border-[1.5px] px-2 py-0.5 font-mono text-[11px] leading-tight uppercase ${STYLES[status]} ${className}`}
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
