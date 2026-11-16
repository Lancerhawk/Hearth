"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

function PendingHint({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] bg-[color-mix(in_srgb,var(--hearth-moss)_18%,transparent)] opacity-0 transition-opacity duration-150",
        pending && "opacity-100",
        className,
      )}
    />
  );
}

export function NavLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link {...props} className={cn("relative", className)}>
      <PendingHint />
      {children}
    </Link>
  );
}
