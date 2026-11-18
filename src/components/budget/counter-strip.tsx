import { StatTile } from "@/components/design/stat-tile";
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
}) {
  const items = [
    {
      label: moneyInLabel,
      value: formatCurrency(income, currency),
      tone: "ember" as const,
    },
    {
      label: "Spent",
      value: formatCurrency(spent, currency),
      tone: "default" as const,
    },
    ...(showRemaining
      ? [
          {
            label: "Remaining",
            value: formatCurrency(remaining, currency),
            tone: "moss" as const,
          },
        ]
      : []),
    ...(expectedFunds != null && expectedFunds > 0
      ? [
          {
            label: `Expected ${moneyInLabel.toLowerCase()}`,
            value: formatCurrency(expectedFunds, currency),
            tone: "ember" as const,
          },
        ]
      : []),
    ...(upcoming != null && upcoming > 0
      ? [
          {
            label: "Upcoming spend",
            value: formatCurrency(upcoming, currency),
            tone: "default" as const,
          },
        ]
      : []),
    {
      label: "Entries",
      value: String(entryCount),
      tone: "default" as const,
    },
    {
      label: "Bills due this month",
      value: String(pendingBills),
      tone: "default" as const,
    },
    {
      label: "Bills skipped this month",
      value: String(skippedBills ?? 0),
      tone: "default" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <StatTile
          key={item.label}
          label={item.label}
          value={item.value}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
