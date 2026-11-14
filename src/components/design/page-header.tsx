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
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
