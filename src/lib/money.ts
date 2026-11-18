import { Decimal } from "@prisma/client/runtime/library";
import { intlLocale, type Locale } from "@/i18n/config";

export type MoneyInput = Decimal | number | string;

export function toNumber(value: MoneyInput): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatCurrency(
  value: MoneyInput,
  currency = "INR",
  locale: Locale | string = "en-IN",
): string {
  const amount = toNumber(value);
  const tag = locale === "en" || locale === "hi" ? intlLocale(locale) : locale;
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Compact currency for tight UI (calendar cells). */
export function formatCurrencyCompact(
  value: MoneyInput,
  currency = "INR",
  locale: Locale | string = "en-IN",
): string {
  const amount = toNumber(value);
  const tag = locale === "en" || locale === "hi" ? intlLocale(locale) : locale;
  return new Intl.NumberFormat(tag, {
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
