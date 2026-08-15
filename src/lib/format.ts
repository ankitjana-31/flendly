const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: string | number | null | undefined) {
  if (value == null) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  return money.format(n);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(`${todayIso()}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function interestSummary(params: {
  interest_type: "none" | "simple" | "compound";
  interest_rate: string | null;
  interest_frequency: "daily" | "monthly" | "yearly" | null;
  compounding: "daily" | "monthly" | "yearly" | null;
}) {
  if (params.interest_type === "none") return "No interest";
  const rate = params.interest_rate ? Number(params.interest_rate) : 0;
  const freq = params.interest_frequency ?? "monthly";
  if (params.interest_type === "simple") {
    return `${rate}% ${freq} · simple`;
  }
  return `${rate}% ${freq} · compound (${params.compounding ?? freq})`;
}
