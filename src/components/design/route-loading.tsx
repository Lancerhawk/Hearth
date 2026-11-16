import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function RouteLoadingSkeleton({
  variant = "page",
  className,
}: {
  variant?: "page" | "month" | "statement";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6",
        variant === "statement" ? "max-w-5xl" : "max-w-5xl",
        className,
      )}
      aria-hidden
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))]" />
          <Skeleton className="h-4 w-64 bg-[color-mix(in_srgb,var(--hearth-moss)_8%,var(--hearth-paper))]" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]" />
      </div>

      {variant === "month" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]"
              />
            ))}
          </div>
          <Skeleton className="h-[28rem] w-full rounded-2xl bg-[color-mix(in_srgb,var(--hearth-moss)_8%,var(--hearth-paper))]" />
        </>
      ) : variant === "statement" ? (
        <>
          <Skeleton className="h-24 w-full rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]" />
          <Skeleton className="h-72 w-full rounded-2xl bg-[color-mix(in_srgb,var(--hearth-moss)_8%,var(--hearth-paper))]" />
        </>
      ) : (
        <>
          <Skeleton className="h-36 w-full rounded-2xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]"
              />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-2xl bg-[color-mix(in_srgb,var(--hearth-moss)_8%,var(--hearth-paper))]" />
            <Skeleton className="h-56 rounded-2xl bg-[color-mix(in_srgb,var(--hearth-moss)_8%,var(--hearth-paper))]" />
          </div>
        </>
      )}
    </div>
  );
}
