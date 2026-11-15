import type { Metadata } from "next";
import Link from "next/link";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
import { FilterChip } from "@/components/design/filter-chip";
import { MoneyList } from "@/components/design/money-list";
import { PageHeader } from "@/components/design/page-header";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { MonthCalendar } from "@/components/month/month-calendar";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { moneyInLabel } from "@/lib/workspace/labels";

export const metadata: Metadata = { title: "Month" };

export default async function MonthPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
    view?: string;
    member?: string;
  }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const { workspace } = await requireMembership(workspaceSlug);
  const { year, month } = parsePeriod(sp.year, sp.month);
  const view = sp.view === "list" ? "list" : "calendar";
  const selectedDay = sp.day ? Number(sp.day) : undefined;
  const memberFilter = sp.member?.trim() || "";
  const { budget, summary, dayMap } = await loadMonthBudget(
    workspace.id,
    year,
    month,
  );
  const members = await prisma.workspaceMembership.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
  });

  const base = `/app/${workspaceSlug}/month`;
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    p.set("year", String(year));
    p.set("month", String(month));
    p.set("view", String(extra.view ?? view));
    if (extra.day) p.set("day", String(extra.day));
    const member = extra.member !== undefined ? extra.member : memberFilter;
    if (member) p.set("member", String(member));
    return `?${p.toString()}`;
  };

  type Activity = {
    id: string;
    title: string;
    amount: number;
    date: string;
    kind: string;
    category?: string;
    addedBy: string;
    createdById: string;
  };

  const activity: Activity[] = [
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title="Month"
        description="Calendar and list of spending activity."
        trailing={<MonthPicker basePath={base} year={year} month={month} />}
      />

      <CounterStrip
        currency={workspace.currency}
        income={summary.totalIncome}
        spent={summary.totalSpent}
        remaining={summary.remaining}
        entryCount={summary.monthEntryCount}
        pendingBills={summary.pendingBillsCount}
        moneyInLabel={moneyInLabel(workspace.kind)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={`${base}${qs({ view: "calendar", day: selectedDay })}`}
          active={view === "calendar"}
        >
          Calendar
        </FilterChip>
        <FilterChip
          href={`${base}${qs({ view: "list", day: undefined })}`}
          active={view === "list"}
        >
          List
        </FilterChip>
        <FilterChip
          href={`${base}${qs({ member: "" })}`}
          active={!memberFilter}
        >
          Everyone
        </FilterChip>
        {members.map((m) => (
          <FilterChip
            key={m.userId}
            href={`${base}${qs({ member: m.userId })}`}
            active={memberFilter === m.userId}
          >
            {m.user.name ?? m.user.email}
          </FilterChip>
        ))}
      </div>

      {view === "calendar" ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Surface padding="sm">
            <MonthCalendar
              year={year}
              month={month}
              dayMap={dayMap}
              currency={workspace.currency}
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
                        {formatCurrency(row.amount, workspace.currency)}
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
      ) : (
        <MoneyList
          emptyTitle="No activity this month"
          items={activity.map((row) => ({
            id: row.id,
            title: row.title,
            meta: `${row.date} · ${row.kind}${row.category ? ` · ${row.category}` : ""} · added by ${row.addedBy}`,
            amount: formatCurrency(row.amount, workspace.currency),
          }))}
        />
      )}
    </div>
  );
}
