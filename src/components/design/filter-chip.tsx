"use client";

import Link, { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

function ChipLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn(pending && "opacity-60")}>
      {children}
      {pending ? "…" : null}
    </span>
  );
}

export function FilterChip({
  href,
  active,
  children,
  replace = false,
  scroll = true,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  replace?: boolean;
  scroll?: boolean;
}) {
  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
          : "border-border text-muted-foreground hover:border-hearth-moss/40 hover:text-hearth-ink",
      )}
    >
      <ChipLabel>{children}</ChipLabel>
    </Link>
  );
}
