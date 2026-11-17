import { StatTile } from "@/components/design/stat-tile";
import { formatCurrency } from "@/lib/money";

export function CounterStrip({
  currency,
  income,
  spent,
  remaining,
  entryCount,
  pendingBills,
  upcoming,
  moneyInLabel = "Funds",
}: {
  currency: string;
  income: number;
  spent: number;
  remaining: number;
  entryCount: number;
  pendingBills: number;
  upcoming?: number;
  moneyInLabel?: string;
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
    {
      label: "Remaining",
      value: formatCurrency(remaining, currency),
      tone: "moss" as const,
    },
    ...(upcoming != null && upcoming > 0
      ? [
          {
            label: "Upcoming",
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
      label: "Bills due",
      value: String(pendingBills),
      tone: "default" as const,
    },
  ];

  const cols =
    upcoming != null && upcoming > 0
      ? "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <div className={`grid ${cols}`}>
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
