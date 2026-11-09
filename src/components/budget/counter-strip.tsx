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
        <div
          key={item.label}
          className="rounded-xl border border-border/70 bg-card/70 px-3 py-3"
        >
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 font-heading text-xl tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
