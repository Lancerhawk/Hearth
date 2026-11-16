import { Decimal } from "@prisma/client/runtime/library";

export type MoneyInput = Decimal | number | string;

export function toNumber(value: MoneyInput): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatCurrency(
  value: MoneyInput,
  currency = "INR",
  locale = "en-IN",
): string {
  const amount = toNumber(value);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Compact currency for tight UI (calendar cells). */
export function formatCurrencyCompact(
  value: MoneyInput,
  currency = "INR",
  locale = "en-IN",
): string {
  const amount = toNumber(value);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function parseAmount(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}
