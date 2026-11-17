import { cn } from "@/lib/utils";

export function QuietList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_32%,white)] hearth-elevate",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function QuietListItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-4",
        className,
      )}
    >
      {children}
    </li>
  );
}
