import Link from "next/link";
import type { DayBucket } from "@/lib/budget/day-map";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MonthCalendar({
  year,
  month,
  dayMap,
  currency,
  basePath,
  selectedDay,
}: {
  year: number;
  month: number;
  dayMap: Record<string, DayBucket>;
  currency: string;
  basePath: string;
  selectedDay?: number;
}) {
  const first = new Date(year, month - 1, 1);
  const startPad = first.getDay();
  const days = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number | null; key: string }> = [];

  for (let i = 0; i < startPad; i++) cells.push({ day: null, key: `pad-${i}` });
  for (let d = 1; d <= days; d++) cells.push({ day: d, key: `d-${d}` });

  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="px-1 py-2 text-center text-xs text-muted-foreground">
          {d}
        </div>
      ))}
      {cells.map((cell) => {
        if (!cell.day) return <div key={cell.key} className="min-h-20 rounded-lg bg-transparent" />;
        const key = `${year}-${String(month).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
        const bucket = dayMap[key];
        const active = selectedDay === cell.day;
        return (
          <Link
            key={cell.key}
            href={`${basePath}?year=${year}&month=${month}&day=${cell.day}&view=calendar`}
            className={cn(
              "min-h-20 rounded-lg border border-border/60 p-2 transition-colors hover:bg-accent/40",
              active && "border-primary bg-accent/50",
            )}
          >
            <p className="text-xs font-medium">{cell.day}</p>
            {bucket ? (
              <>
                <p className="mt-1 text-[11px] text-muted-foreground">{bucket.count} item(s)</p>
                <p className="text-xs font-medium">
                  {formatCurrency(bucket.spend, currency)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">Add</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
