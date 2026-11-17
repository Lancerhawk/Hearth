import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const mossPulse =
  "bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]";

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
        "hearth-soft-in mx-auto flex w-full max-w-5xl flex-col gap-6",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className={cn("h-8 w-48", mossPulse)} />
          <Skeleton className={cn("h-4 w-64", mossPulse)} />
        </div>
        <Skeleton className={cn("h-9 w-36 rounded-lg", mossPulse)} />
      </div>

      {variant === "month" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-20 rounded-xl", mossPulse)}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          <Skeleton className={cn("h-[28rem] w-full rounded-2xl", mossPulse)} />
        </>
      ) : variant === "statement" ? (
        <>
          <Skeleton className={cn("h-24 w-full rounded-xl", mossPulse)} />
          <Skeleton className={cn("h-72 w-full rounded-2xl", mossPulse)} />
        </>
      ) : (
        <>
          <Skeleton className={cn("h-36 w-full rounded-2xl", mossPulse)} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-20 rounded-xl", mossPulse)}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className={cn("h-56 rounded-2xl", mossPulse)} />
            <Skeleton className={cn("h-56 rounded-2xl", mossPulse)} />
          </div>
        </>
      )}
    </div>
  );
}
