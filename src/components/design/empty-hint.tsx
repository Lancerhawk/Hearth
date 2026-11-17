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
        "rounded-2xl border border-dashed border-border/80 bg-[color-mix(in_srgb,var(--hearth-paper)_45%,white)] px-6 py-12 text-center",
        className,
      )}
    >
      <p className="font-heading text-xl tracking-tight text-hearth-ink">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
