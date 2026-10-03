export interface ApprovalWindowInfo {
  approvalHours: 12 | 24;
  approvalDeadline: Date;
  isExpired: boolean;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  countdownText: string;
}

/**
 * Calculates the approval window for a loan proposal:
 * - If repayment duration is 1 or 2 days: approval must be completed within 12 hours.
 * - If repayment duration is > 2 days: approval must be completed within 24 hours.
 * - Approval deadline is also capped by the repayment deadline itself.
 */
export function calculateApprovalWindow(offer: {
  created_at: string;
  deadline: string;
}): ApprovalWindowInfo {
  const createdAt = new Date(offer.created_at).getTime();
  const repaymentDeadline = new Date(offer.deadline + "T23:59:59").getTime();

  const createdDateOnly = new Date(offer.created_at.slice(0, 10) + "T00:00:00").getTime();
  const repaymentDateOnly = new Date(offer.deadline + "T00:00:00").getTime();
  const diffDays = Math.max(1, Math.round((repaymentDateOnly - createdDateOnly) / (1000 * 60 * 60 * 24)));

  const approvalHours: 12 | 24 = diffDays <= 2 ? 12 : 24;
  const windowEnd = createdAt + approvalHours * 60 * 60 * 1000;
  const approvalDeadlineMs = Math.min(windowEnd, repaymentDeadline);
  const approvalDeadline = new Date(approvalDeadlineMs);

  const now = Date.now();
  const isExpired = now >= approvalDeadlineMs;
  const remainingMs = Math.max(0, approvalDeadlineMs - now);
  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  let countdownText = "";
  if (isExpired) {
    countdownText = "EXPIRED";
  } else if (remainingHours > 0) {
    countdownText = `${remainingHours}h ${remainingMinutes}m left`;
  } else {
    countdownText = `${remainingMinutes}m left`;
  }

  return {
    approvalHours,
    approvalDeadline,
    isExpired,
    remainingMs,
    remainingHours,
    remainingMinutes,
    countdownText,
  };
}
