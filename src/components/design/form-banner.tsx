import { cn } from "@/lib/utils";

export function FormBanner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed",
        tone === "error" &&
          "border-destructive/25 bg-destructive/10 text-destructive",
        tone === "success" &&
          "border-hearth-moss/25 bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))] text-hearth-moss",
      )}
    >
      {children}
    </p>
  );
}
