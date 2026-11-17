"use client";

import type { DayBucket } from "@/lib/budget/day-map";
import { formatCurrencyCompact } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MonthCalendar({
  year,
  month,
  dayMap,
  currency,
  selectedDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  dayMap: Record<string, DayBucket>;
  currency: string;
  selectedDay?: number;
  onSelectDay: (day: number) => void;
}) {
  const first = new Date(year, month - 1, 1);
  const startPad = first.getDay();
  const days = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number | null; key: string }> = [];

  for (let i = 0; i < startPad; i++) cells.push({ day: null, key: `pad-${i}` });
  for (let d = 1; d <= days; d++) cells.push({ day: d, key: `d-${d}` });

  return (
    <div className="grid grid-cols-7 gap-1 text-[11px] sm:gap-1.5 sm:text-sm">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <div
          key={`${d}-${i}`}
          className="px-0.5 py-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:px-1 sm:py-2 sm:text-[11px]"
          title={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
        >
          <span className="sm:hidden">{d}</span>
          <span className="hidden sm:inline">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
          </span>
        </div>
      ))}
      {cells.map((cell) => {
        if (!cell.day) {
          return (
            <div
              key={cell.key}
              className="min-h-14 rounded-lg bg-transparent sm:min-h-20 sm:rounded-xl"
            />
          );
        }
        const key = `${year}-${String(month).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
        const bucket = dayMap[key];
        const active = selectedDay === cell.day;
        return (
          <button
            key={cell.key}
            type="button"
            onClick={() => onSelectDay(cell.day!)}
            className={cn(
              "flex min-h-14 min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)] p-1 text-left transition-colors hover:border-hearth-moss/40 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_8%,white)] sm:min-h-20 sm:p-2",
              active &&
                "border-hearth-moss/60 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--hearth-moss)_40%,transparent)]",
            )}
          >
            <p className="text-[10px] font-medium text-hearth-ink sm:text-xs">
              {cell.day}
            </p>
            {bucket ? (
              <div className="mt-0.5 min-w-0 flex-1 sm:mt-1">
                <p className="truncate text-[9px] leading-tight text-muted-foreground sm:text-[11px]">
                  {bucket.count}
                  <span className="hidden sm:inline"> item(s)</span>
                </p>
                <p
                  className="truncate text-[10px] font-medium leading-tight text-hearth-ink sm:text-xs"
                  title={formatCurrencyCompact(bucket.spend, currency)}
                >
                  {formatCurrencyCompact(bucket.spend, currency)}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-[9px] text-muted-foreground sm:mt-2 sm:text-[11px]">
                ·
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
