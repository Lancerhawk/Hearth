import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  trailing,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-[1.85rem] leading-[1.1] tracking-tight text-hearth-ink md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
