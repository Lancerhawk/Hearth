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
}: {
  items: MoneyListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyHint title={emptyTitle} description={emptyDescription} className={className} />
    );
  }

  return (
    <ul
      className={cn(
        "divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
        >
          <div className="min-w-0">
            <p className="font-medium text-hearth-ink">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.meta}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg tracking-tight text-hearth-ink">
              {item.amount}
            </span>
            {item.action}
          </div>
        </li>
      ))}
    </ul>
  );
}
