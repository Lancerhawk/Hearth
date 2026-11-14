import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
          : "border-border text-muted-foreground hover:border-hearth-moss/40 hover:text-hearth-ink",
      )}
    >
      {children}
    </Link>
  );
}
