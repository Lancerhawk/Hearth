import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/75 px-3.5 py-3.5",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-heading text-xl tracking-tight text-hearth-ink">
        {value}
      </p>
    </div>
  );
}
