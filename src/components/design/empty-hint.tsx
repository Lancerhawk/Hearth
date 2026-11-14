import { cn } from "@/lib/utils";

export function EmptyHint({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border/90 bg-card/40 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="font-heading text-xl text-hearth-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
