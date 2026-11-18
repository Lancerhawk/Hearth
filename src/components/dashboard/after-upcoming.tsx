"use client";

import Link from "next/link";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function AfterUpcoming({
  currency,
  remaining,
  stillAhead,
  expectedIn,
  projectedRemaining,
  moneyInLabel,
  billsHref,
}: {
  currency: string;
  remaining: number;
  /** Pending bills due now + future-dated outflows */
  stillAhead: number;
  /** Same-month funds dated after today */
  expectedIn: number;
  projectedRemaining: number;
  moneyInLabel: string;
  billsHref: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const fundsLabel =
    moneyInLabel === "Income" ? t("counters.income") : t("counters.funds");
  const fundsLower = fundsLabel.toLowerCase();

  const rows = [
    {
      label: t("dashboard.remainingNow"),
      value: remaining,
      emphasize: false,
    },
    ...(expectedIn > 0
      ? [
          {
            label: t("counters.expectedFunds", { label: fundsLower }),
            value: expectedIn,
            emphasize: false,
          },
        ]
      : []),
    { label: t("dashboard.stillAhead"), value: stillAhead, emphasize: false },
    {
      label: t("dashboard.leftWhenClears"),
      value: projectedRemaining,
      emphasize: true,
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-xl tracking-tight text-hearth-ink">
        {t("dashboard.afterUpcoming")}
      </h2>
      <p className="mt-1 text-xs text-hearth-ink/50">
        {t("dashboard.afterUpcomingHint", { label: fundsLower })}
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="text-hearth-ink/65">{row.label}</span>
            <span
              className={cn(
                "shrink-0 font-heading tabular-money",
                row.emphasize ? "text-hearth-moss" : "text-hearth-ink",
              )}
            >
              {formatCurrency(row.value, currency, locale)}
            </span>
          </li>
        ))}
      </ul>

      {stillAhead <= 0 && expectedIn <= 0 ? (
        <p className="mt-4 text-sm text-hearth-ink/55">
          {t("dashboard.nothingAhead")}
        </p>
      ) : null}

      <Link
        href={billsHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-5",
        )}
      >
        {t("bills.manage")}
      </Link>
    </div>
  );
}
