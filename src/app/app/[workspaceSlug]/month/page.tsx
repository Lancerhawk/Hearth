import type { Metadata } from "next";
import { Suspense } from "react";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
import { FilterChip } from "@/components/design/filter-chip";
import { PageHeader } from "@/components/design/page-header";
import { RouteLoadingSkeleton } from "@/components/design/route-loading";
import { MonthBody } from "@/components/month/month-body";
import { requireMembership } from "@/lib/budget/access";
import { loadMonthSummary } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
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

  const [{ summary }, members] = await Promise.all([
    loadMonthSummary(workspace.id, year, month),
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
    }),
  ]);

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

      <Suspense fallback={<RouteLoadingSkeleton variant="month" />}>
        <MonthBody
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          currency={workspace.currency}
          year={year}
          month={month}
          view={view}
          selectedDay={selectedDay}
          memberFilter={memberFilter}
          base={base}
        />
      </Suspense>
    </div>
  );
}
