import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MonthPicker({
  basePath,
  year,
  month,
}: {
  basePath: string;
  year: number;
  month: number;
}) {
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const label = new Date(year, month - 1, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${basePath}?year=${prev.year}&month=${prev.month}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        ←
      </Link>
      <p className="min-w-40 text-center font-heading text-lg">{label}</p>
      <Link
        href={`${basePath}?year=${next.year}&month=${next.month}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        →
      </Link>
    </div>
  );
}
