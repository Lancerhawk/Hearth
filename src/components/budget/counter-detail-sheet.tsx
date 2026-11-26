"use client";

import { useLocale, useT } from "@/components/i18n/locale-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  CounterBreakdown,
  CounterKey,
} from "@/lib/budget/counter-breakdowns";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

const TITLE_KEYS: Record<CounterKey, string> = {
  funds: "counters.funds",
  spent: "counters.spent",
  remaining: "counters.remaining",
  expectedFunds: "counters.expectedFunds",
  upcomingSpend: "counters.upcomingSpend",
  entries: "counters.entries",
  billsDue: "counters.billsDue",
  billsSkipped: "counters.billsSkipped",
};

const DESC_KEYS: Record<CounterKey, string> = {
  funds: "counters.fundsDescription",
  spent: "counters.spentDescription",
  remaining: "counters.remainingDescription",
  expectedFunds: "counters.expectedDescription",
  upcomingSpend: "counters.upcomingDescription",
  entries: "counters.entriesDescription",
  billsDue: "counters.billsDueDescription",
  billsSkipped: "counters.billsSkippedDescription",
};

export function CounterDetailSheet({
  open,
  onOpenChange,
  breakdown,
  currency,
  moneyInLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: CounterBreakdown | null;
  currency: string;
  moneyInLabel: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const fundsLabel =
    moneyInLabel === "Income" ? t("counters.income") : t("counters.funds");

  const title = breakdown
    ? breakdown.key === "funds" || breakdown.key === "expectedFunds"
      ? breakdown.key === "expectedFunds"
        ? t(TITLE_KEYS[breakdown.key], { label: fundsLabel.toLowerCase() })
        : fundsLabel
      : t(TITLE_KEYS[breakdown.key])
    : "";
  const description = breakdown
    ? t(DESC_KEYS[breakdown.key], { label: fundsLabel })
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_72%,white)] p-0 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
      >
        {breakdown ? (
          <>
            <SheetHeader className="shrink-0 border-b border-border/60 bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)] px-5 py-4 pr-12">
              <SheetTitle className="font-heading text-xl tracking-tight text-hearth-ink">
                {title}
              </SheetTitle>
              <SheetDescription className="text-hearth-ink/55">
                {description}
              </SheetDescription>
              <p className="mt-3 font-heading text-3xl tracking-tight text-hearth-ink tabular-money">
                {breakdown.key === "entries" ||
                breakdown.key === "billsDue" ||
                breakdown.key === "billsSkipped"
                  ? String(breakdown.total)
                  : formatCurrency(breakdown.total, currency, locale)}
              </p>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {breakdown.mode === "formula" && breakdown.formula ? (
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between gap-3">
                    <span className="text-hearth-ink/65">{fundsLabel}</span>
                    <span className="font-heading tabular-money text-hearth-ink">
                      {formatCurrency(
                        breakdown.formula.funds,
                        currency,
                        locale,
                      )}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-hearth-ink/65">
                      {t("counters.spent")}
                    </span>
                    <span className="font-heading tabular-money text-hearth-ink">
                      −
                      {formatCurrency(
                        breakdown.formula.spent,
                        currency,
                        locale,
                      )}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3 border-t border-border/60 pt-3">
                    <span className="font-medium text-hearth-ink">
                      {t("counters.remaining")}
                    </span>
                    <span className="font-heading tabular-money text-hearth-moss">
                      {formatCurrency(
                        breakdown.formula.remaining,
                        currency,
                        locale,
                      )}
                    </span>
                  </li>
                </ul>
              ) : breakdown.rows.length === 0 ? (
                <p className="text-sm text-hearth-ink/55">
                  {t("counters.nothingInTotal")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {breakdown.rows.map((row) => (
                    <li
                      key={`${row.kind}-${row.id}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-medium text-hearth-ink">
                          {row.title}
                        </span>
                        <span className="text-hearth-ink/50">
                          {" "}
                          · {row.kind.toLowerCase()}
                          {row.date ? ` · ${row.date}` : ""}
                          {row.meta ? ` · ${row.meta}` : ""}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 font-heading tabular-money",
                          row.sign > 0
                            ? "text-hearth-ember"
                            : "text-hearth-ink",
                        )}
                      >
                        {row.sign > 0 ? "+" : ""}
                        {formatCurrency(row.amount, currency, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
