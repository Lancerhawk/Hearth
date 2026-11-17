import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  className,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  tone?: "default" | "ember" | "moss";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 hearth-elevate",
        tone === "default" &&
          "border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_35%,white)]",
        tone === "ember" &&
          "border-[color-mix(in_srgb,var(--hearth-ember)_28%,var(--border))] bg-[color-mix(in_srgb,var(--hearth-ember)_10%,white)]",
        tone === "moss" &&
          "border-hearth-moss/25 bg-[color-mix(in_srgb,var(--hearth-moss)_10%,white)]",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl tracking-tight text-hearth-ink tabular-money">
        {value}
      </p>
    </div>
  );
}
