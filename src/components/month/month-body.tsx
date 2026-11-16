import Link from "next/link";
import { MoneyList } from "@/components/design/money-list";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { MonthCalendar } from "@/components/month/month-calendar";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { formatCurrency, toNumber } from "@/lib/money";

export async function MonthBody({
  workspaceId,
  workspaceSlug,
  currency,
  year,
  month,
  view,
  selectedDay,
  memberFilter,
  base,
}: {
  workspaceId: string;
  workspaceSlug: string;
  currency: string;
  year: number;
  month: number;
  view: "calendar" | "list";
  selectedDay?: number;
  memberFilter: string;
  base: string;
}) {
  const { budget, dayMap } = await loadMonthBudget(workspaceId, year, month);

  const activity = [
    ...budget.expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: toNumber(e.amount),
      date: e.spentOn.toISOString().slice(0, 10),
      kind: "Expense",
      category: e.category?.name,
      addedBy: actorLabel(e.createdBy),
      createdById: e.createdById,
    })),
    ...budget.charges.map((c) => ({
      id: c.id,
      title: c.title,
      amount: toNumber(c.amount),
      date: c.chargedOn.toISOString().slice(0, 10),
      kind: "Charge",
      category: c.category?.name,
      addedBy: actorLabel(c.createdBy),
      createdById: c.createdById,
    })),
  ]
    .filter((row) => (memberFilter ? row.createdById === memberFilter : true))
    .filter((row) =>
      selectedDay ? Number(row.date.slice(-2)) === selectedDay : true,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (view === "list") {
    return (
      <MoneyList
        emptyTitle="No activity this month"
        items={activity.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${row.date} · ${row.kind}${row.category ? ` · ${row.category}` : ""} · added by ${row.addedBy}`,
          amount: formatCurrency(row.amount, currency),
        }))}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Surface padding="sm">
        <MonthCalendar
          year={year}
          month={month}
          dayMap={dayMap}
          currency={currency}
          basePath={base}
          selectedDay={selectedDay}
        />
      </Surface>
      <Surface>
        <SectionTitle>
          {selectedDay ? `Day ${selectedDay}` : "Pick a day"}
        </SectionTitle>
        <ul className="mt-3 space-y-2">
          {activity.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              {selectedDay
                ? "Nothing logged."
                : "Select a day on the calendar."}
            </li>
          ) : (
            activity.map((row) => (
              <li key={row.id} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-hearth-ink">
                    {row.title}
                  </span>
                  <span className="font-heading text-hearth-ink">
                    {formatCurrency(row.amount, currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.kind}
                  {row.category ? ` · ${row.category}` : ""} · {row.addedBy}
                </p>
              </li>
            ))
          )}
        </ul>
        <Link
          href={`/app/${workspaceSlug}/expenses?year=${year}&month=${month}`}
          className="mt-4 inline-block text-sm text-hearth-moss underline-offset-4 hover:underline"
        >
          Add expense
        </Link>
      </Surface>
    </div>
  );
}
