"use client";

import Link from "next/link";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { toIsoDate } from "@/lib/budget/iso-date";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function NextMonthFunds({
  currency,
  moneyInLabel,
  label,
  year,
  month,
  amount,
  count,
  leftoverHint,
  rows,
  href,
}: {
  currency: string;
  moneyInLabel: string;
  label: string;
  year: number;
  month: number;
  amount: number;
  count: number;
  leftoverHint: number;
  rows: Array<{ id: string; title: string; amount: number; on: Date }>;
  href: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const fundsLabel =
    moneyInLabel === "Income" ? t("counters.income") : t("counters.funds");
  const moneyIn = fundsLabel.toLowerCase();

  return (
    <div>
      <h2 className="font-heading text-xl tracking-tight text-hearth-ink">
        {t("dashboard.nextMonth", { label })}
      </h2>
      <p className="mt-1 text-xs text-hearth-ink/50">
        {t("dashboard.nextMonthHint", { moneyIn })}
      </p>

      <p className="mt-4 font-heading text-3xl tracking-tight text-hearth-ember tabular-money">
        {formatCurrency(amount, currency, locale)}
      </p>
      <p className="mt-1 text-sm text-hearth-ink/55">
        {count === 0
          ? t("dashboard.noFundsLogged", { moneyIn, label })
          : t("dashboard.entriesLogged", {
              count,
              entries: t("counters.entries").toLowerCase(),
            })}
      </p>

      {leftoverHint > 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-hearth-ink/50">
          {t("dashboard.leftoverHint", {
            amount: formatCurrency(leftoverHint, currency, locale),
            label,
          })}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-hearth-ink">
                <span className="font-medium">{row.title}</span>
                <span className="text-hearth-ink/50">
                  {" "}
                  · {toIsoDate(row.on)}
                </span>
              </span>
              <span className="shrink-0 font-heading tabular-money text-hearth-ink">
                {formatCurrency(row.amount, currency, locale)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={`${href}?year=${year}&month=${month}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-5",
        )}
      >
        {t("dashboard.openMonth", { month: label.split(" ")[0] })}
      </Link>
    </div>
  );
}
