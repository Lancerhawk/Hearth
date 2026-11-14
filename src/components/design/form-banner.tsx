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
        "rounded-lg px-3 py-2 text-sm",
        tone === "error" && "bg-destructive/10 text-destructive",
        tone === "success" &&
          "bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))] text-hearth-moss",
      )}
    >
      {children}
    </p>
  );
}
