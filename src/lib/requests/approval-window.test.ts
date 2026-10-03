import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateApprovalWindow } from "./approval-window";

describe("calculateApprovalWindow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("assigns a 12-hour approval window if repayment deadline is within 1 or 2 days", () => {
    // Offer created at 2026-10-04T10:00:00Z, deadline 2 days later: 2026-10-06
    const createdAt = "2026-10-04T10:00:00.000Z";
    vi.setSystemTime(new Date(createdAt));

    const result = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-06",
    });

    expect(result.approvalHours).toBe(12);
    expect(result.isExpired).toBe(false);
    expect(result.remainingHours).toBe(12);

    // Fast-forward 11 hours: still not expired
    vi.advanceTimersByTime(11 * 60 * 60 * 1000);
    const result11h = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-06",
    });
    expect(result11h.isExpired).toBe(false);
    expect(result11h.remainingHours).toBe(1);

    // Fast-forward another 2 hours (total 13h): expired!
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);
    const result13h = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-06",
    });
    expect(result13h.isExpired).toBe(true);
    expect(result13h.countdownText).toBe("EXPIRED");
  });

  it("assigns a 24-hour approval window if repayment deadline is more than 2 days", () => {
    // Offer created at 2026-10-04T10:00:00Z, deadline 10 days later: 2026-10-14
    const createdAt = "2026-10-04T10:00:00.000Z";
    vi.setSystemTime(new Date(createdAt));

    const result = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-14",
    });

    expect(result.approvalHours).toBe(24);
    expect(result.isExpired).toBe(false);
    expect(result.remainingHours).toBe(24);

    // Fast-forward 20 hours: still not expired
    vi.advanceTimersByTime(20 * 60 * 60 * 1000);
    const result20h = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-14",
    });
    expect(result20h.isExpired).toBe(false);

    // Fast-forward another 5 hours (total 25h): expired!
    vi.advanceTimersByTime(5 * 60 * 60 * 1000);
    const result25h = calculateApprovalWindow({
      created_at: createdAt,
      deadline: "2026-10-14",
    });
    expect(result25h.isExpired).toBe(true);
    expect(result25h.countdownText).toBe("EXPIRED");
  });
});
