"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CounterBreakdown } from "@/lib/budget/counter-breakdowns";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

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
                {breakdown.title}
              </SheetTitle>
              <SheetDescription className="text-hearth-ink/55">
                {breakdown.description}
              </SheetDescription>
              <p className="mt-3 font-heading text-3xl tracking-tight text-hearth-ink tabular-money">
                {breakdown.key === "entries" ||
                breakdown.key === "billsDue" ||
                breakdown.key === "billsSkipped"
                  ? String(breakdown.total)
                  : formatCurrency(breakdown.total, currency)}
              </p>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {breakdown.mode === "formula" && breakdown.formula ? (
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between gap-3">
                    <span className="text-hearth-ink/65">{moneyInLabel}</span>
                    <span className="font-heading tabular-money text-hearth-ink">
                      {formatCurrency(breakdown.formula.funds, currency)}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-hearth-ink/65">Spent</span>
                    <span className="font-heading tabular-money text-hearth-ink">
                      −{formatCurrency(breakdown.formula.spent, currency)}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3 border-t border-border/60 pt-3">
                    <span className="font-medium text-hearth-ink">
                      Remaining
                    </span>
                    <span className="font-heading tabular-money text-hearth-moss">
                      {formatCurrency(breakdown.formula.remaining, currency)}
                    </span>
                  </li>
                </ul>
              ) : breakdown.rows.length === 0 ? (
                <p className="text-sm text-hearth-ink/55">
                  Nothing in this total yet.
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
                        {formatCurrency(row.amount, currency)}
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
