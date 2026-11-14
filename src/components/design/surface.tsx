import { cn } from "@/lib/utils";

export function Surface({
  children,
  className,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const pads = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/80 shadow-[0_1px_0_color-mix(in_srgb,var(--hearth-ink)_4%,transparent)]",
        pads[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
