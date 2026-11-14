import { StatTile } from "@/components/design/stat-tile";
import { formatCurrency } from "@/lib/money";

export function CounterStrip({
  currency,
  income,
  spent,
  remaining,
  entryCount,
  pendingBills,
}: {
  currency: string;
  income: number;
  spent: number;
  remaining: number;
  entryCount: number;
  pendingBills: number;
}) {
  const items = [
    { label: "Income", value: formatCurrency(income, currency) },
    { label: "Spent", value: formatCurrency(spent, currency) },
    { label: "Remaining", value: formatCurrency(remaining, currency) },
    { label: "Entries", value: String(entryCount) },
    { label: "Bills due", value: String(pendingBills) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <StatTile key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
