import { cn } from "@/lib/utils";

export function Surface({
  children,
  className,
  padding = "md",
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  tone?: "default" | "quiet" | "emphasis";
}) {
  const pads = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  const tones = {
    default:
      "border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_35%,white)] hearth-elevate",
    quiet:
      "border-border/50 bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)]/80",
    emphasis:
      "border-hearth-moss/25 bg-[color-mix(in_srgb,var(--hearth-moss)_8%,white)] hearth-elevate-soft",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-[2px]",
        pads[padding],
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
