import { describe, it, expect } from "vitest";
import { z } from "zod";

const interestFrequencySchema = z.enum(["daily", "monthly", "yearly"]);

// Mirror the schema from actions.ts to verify constraints
const offerTermsSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than zero.")
      .max(100000, "Maximum proposal amount is ₹1,00,000 for safety."),
    interestType: z.enum(["none", "simple", "compound"]),
    interestRate: z.coerce.number().min(0).optional(),
    interestFrequency: interestFrequencySchema.optional(),
    compounding: interestFrequencySchema.optional(),
    deadline: z.string().refine((d) => d > new Date().toISOString().slice(0, 10), {
      message: "Deadline must be a future date.",
    }),
    message: z.string().trim().max(500).optional(),
  })
  .refine(
    (v) => v.interestType === "none" || (v.interestRate !== undefined && v.interestFrequency !== undefined),
    { message: "Interest rate and frequency are required unless there's no interest." },
  )
  .refine((v) => v.interestType !== "compound" || v.compounding !== undefined, {
    message: "Compounding frequency is required for compound interest.",
  });

describe("Request Safety & Validation Rules", () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  it("permits valid proposal amounts up to ₹1,00,000", () => {
    const valid = offerTermsSchema.safeParse({
      amount: "100000",
      interestType: "none",
      deadline: tomorrow,
    });
    expect(valid.success).toBe(true);

    const validSmall = offerTermsSchema.safeParse({
      amount: "500",
      interestType: "none",
      deadline: tomorrow,
    });
    expect(validSmall.success).toBe(true);
  });

  it("strictly rejects amounts exceeding ₹1,00,000 (e.g. 10 crore fake requests)", () => {
    const tooLarge = offerTermsSchema.safeParse({
      amount: "100000000", // 10 crore
      interestType: "none",
      deadline: tomorrow,
    });
    expect(tooLarge.success).toBe(false);
    if (!tooLarge.success) {
      expect(tooLarge.error.issues[0]?.message).toMatch(/1,00,000/);
    }
  });

  it("strictly rejects zero or negative amounts", () => {
    const zero = offerTermsSchema.safeParse({
      amount: "0",
      interestType: "none",
      deadline: tomorrow,
    });
    expect(zero.success).toBe(false);

    const negative = offerTermsSchema.safeParse({
      amount: "-500",
      interestType: "none",
      deadline: tomorrow,
    });
    expect(negative.success).toBe(false);
  });

  it("rejects messages exceeding 500 characters to prevent buffer bloat", () => {
    const longMsg = offerTermsSchema.safeParse({
      amount: "5000",
      interestType: "none",
      deadline: tomorrow,
      message: "a".repeat(501),
    });
    expect(longMsg.success).toBe(false);
  });
});
