import type { Metadata } from "next";
import Link from "next/link";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
import { MonthCalendar } from "@/components/month/month-calendar";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
  const { budget, summary, dayMap } = await loadMonthBudget(workspace.id, year, month);
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
    if (extra.member ?? memberFilter) p.set("member", String(extra.member ?? memberFilter));
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
      selectedDay
        ? Number(row.date.slice(-2)) === selectedDay
        : true,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Month</h1>
          <p className="text-muted-foreground">Calendar and list of spending activity.</p>
        </div>
        <MonthPicker basePath={base} year={year} month={month} />
      </div>

      <CounterStrip
        currency={workspace.currency}
        income={summary.totalIncome}
        spent={summary.totalSpent}
        remaining={summary.remaining}
        entryCount={summary.monthEntryCount}
        pendingBills={summary.pendingBillsCount}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`${base}${qs({ view: "calendar", day: selectedDay })}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            view === "calendar" ? "border-primary bg-accent" : "border-border",
          )}
        >
          Calendar
        </Link>
        <Link
          href={`${base}${qs({ view: "list", day: undefined })}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            view === "list" ? "border-primary bg-accent" : "border-border",
          )}
        >
          List
        </Link>
        <Link
          href={`${base}${qs({ member: "" })}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            !memberFilter ? "border-primary bg-accent" : "border-border",
          )}
        >
          Everyone
        </Link>
        {members.map((m) => (
          <Link
            key={m.userId}
            href={`${base}${qs({ member: m.userId })}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              memberFilter === m.userId ? "border-primary bg-accent" : "border-border",
            )}
          >
            {m.user.name ?? m.user.email}
          </Link>
        ))}
      </div>

      {view === "calendar" ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <MonthCalendar
            year={year}
            month={month}
            dayMap={dayMap}
            currency={workspace.currency}
            basePath={base}
            selectedDay={selectedDay}
          />
          <section className="rounded-xl border border-border/70 bg-card/60 p-4">
            <h2 className="font-heading text-xl">
              {selectedDay ? `Day ${selectedDay}` : "Pick a day"}
            </h2>
            <ul className="mt-3 space-y-2">
              {activity.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  {selectedDay ? "Nothing logged." : "Select a day on the calendar."}
                </li>
              ) : (
                activity.map((row) => (
                  <li key={row.id} className="text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{row.title}</span>
                      <span>{formatCurrency(row.amount, workspace.currency)}</span>
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
              className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Add expense
            </Link>
          </section>
        </div>
      ) : (
        <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
          {activity.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">No activity this month.</li>
          ) : (
            activity.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.date} · {row.kind}
                    {row.category ? ` · ${row.category}` : ""} · added by {row.addedBy}
                  </p>
                </div>
                <span>{formatCurrency(row.amount, workspace.currency)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
