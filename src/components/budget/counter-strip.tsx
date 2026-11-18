"use client";

import { useState } from "react";
import { CounterDetailSheet } from "@/components/budget/counter-detail-sheet";
import { StatTile } from "@/components/design/stat-tile";
import type {
  CounterBreakdown,
  CounterKey,
} from "@/lib/budget/counter-breakdowns";
import { formatCurrency } from "@/lib/money";

export function CounterStrip({
  currency,
  income,
  spent,
  remaining,
  entryCount,
  pendingBills,
  skippedBills,
  upcoming,
  expectedFunds,
  moneyInLabel = "Funds",
  showRemaining = true,
  breakdowns,
}: {
  currency: string;
  income: number;
  spent: number;
  remaining: number;
  entryCount: number;
  pendingBills: number;
  skippedBills?: number;
  upcoming?: number;
  /** Same-month funds dated after today */
  expectedFunds?: number;
  moneyInLabel?: string;
  /** Set false when Remaining is already shown in a hero above. */
  showRemaining?: boolean;
  /** When set, tiles open a detail sheet for that total. */
  breakdowns?: Record<CounterKey, CounterBreakdown>;
}) {
  const [openKey, setOpenKey] = useState<CounterKey | null>(null);
  const interactive = Boolean(breakdowns);

  const items: Array<{
    key: CounterKey;
    label: string;
    value: string;
    tone: "default" | "ember" | "moss";
  }> = [
    {
      key: "funds",
      label: moneyInLabel,
      value: formatCurrency(income, currency),
      tone: "ember",
    },
    {
      key: "spent",
      label: "Spent",
      value: formatCurrency(spent, currency),
      tone: "default",
    },
    ...(showRemaining
      ? [
          {
            key: "remaining" as const,
            label: "Remaining",
            value: formatCurrency(remaining, currency),
            tone: "moss" as const,
          },
        ]
      : []),
    ...(expectedFunds != null && expectedFunds > 0
      ? [
          {
            key: "expectedFunds" as const,
            label: `Expected ${moneyInLabel.toLowerCase()}`,
            value: formatCurrency(expectedFunds, currency),
            tone: "ember" as const,
          },
        ]
      : []),
    ...(upcoming != null && upcoming > 0
      ? [
          {
            key: "upcomingSpend" as const,
            label: "Upcoming spend",
            value: formatCurrency(upcoming, currency),
            tone: "default" as const,
          },
        ]
      : []),
    {
      key: "entries",
      label: "Entries",
      value: String(entryCount),
      tone: "default",
    },
    {
      key: "billsDue",
      label: "Bills due this month",
      value: String(pendingBills),
      tone: "default",
    },
    {
      key: "billsSkipped",
      label: "Bills skipped this month",
      value: String(skippedBills ?? 0),
      tone: "default",
    },
  ];

  const active = openKey && breakdowns ? breakdowns[openKey] : null;

  return (
    <>
      <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <StatTile
            key={item.key}
            label={item.label}
            value={item.value}
            tone={item.tone}
            expanded={interactive && openKey === item.key}
            onClick={interactive ? () => setOpenKey(item.key) : undefined}
          />
        ))}
      </div>

      {breakdowns ? (
        <CounterDetailSheet
          open={openKey !== null}
          onOpenChange={(open) => {
            if (!open) setOpenKey(null);
          }}
          breakdown={active}
          currency={currency}
          moneyInLabel={moneyInLabel}
        />
      ) : null}
    </>
  );
}
