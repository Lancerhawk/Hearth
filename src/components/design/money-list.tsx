import { EmptyHint } from "@/components/design/empty-hint";
import { cn } from "@/lib/utils";

export type MoneyListItem = {
  id: string;
  title: string;
  meta: string;
  amount: React.ReactNode;
  action?: React.ReactNode;
};

export function MoneyList({
  items,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  className,
  amountTone = "default",
}: {
  items: MoneyListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  amountTone?: "default" | "ember" | "moss";
}) {
  if (items.length === 0) {
    return (
      <EmptyHint
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <ul
      className={cn(
        "divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_32%,white)] hearth-elevate",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
        >
          <div className="min-w-0">
            <p className="font-medium text-hearth-ink">{item.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-hearth-ink/55">
              {item.meta}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-heading text-lg tracking-tight tabular-money",
                amountTone === "ember" && "text-hearth-ember",
                amountTone === "moss" && "text-hearth-moss",
                amountTone === "default" && "text-hearth-ink",
              )}
            >
              {item.amount}
            </span>
            {item.action}
          </div>
        </li>
      ))}
    </ul>
  );
}
