"use client";

import { useLocale, useT } from "@/components/i18n/locale-provider";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export type TopSpendRow = {
  name: string;
  amount: number;
};

export function TopSpendRanking({
  rows,
  currency,
  totalSpent,
}: {
  rows: TopSpendRow[];
  currency: string;
  totalSpent: number;
}) {
  const t = useT();
  const { locale } = useLocale();

  if (rows.length === 0) {
    return (
      <p className="text-sm text-hearth-ink/55">
        {t("dashboard.noCommittedSpend")}
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <ol className="space-y-4">
      {rows.map((row, index) => {
        const share =
          totalSpent > 0 ? Math.round((row.amount / totalSpent) * 100) : 0;
        const width = Math.max(8, Math.round((row.amount / max) * 100));
        return (
          <li key={row.name}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-hearth-ink">
                  <span className="mr-2 font-heading text-hearth-moss/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {row.name}
                </p>
                <p className="mt-0.5 text-xs text-hearth-ink/45">
                  {t("dashboard.ofSpent", { pct: share })}
                </p>
              </div>
              <span className="shrink-0 font-heading text-base tabular-money text-hearth-ink">
                {formatCurrency(row.amount, currency, locale)}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--hearth-moss)_10%,white)]">
              <div
                className={cn("h-full rounded-full bg-hearth-moss")}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
