import type { Metadata } from "next";
import { Suspense } from "react";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
import { PageHeader } from "@/components/design/page-header";
import { RouteLoadingSkeleton } from "@/components/design/route-loading";
import { MonthBody } from "@/components/month/month-body";
import { requireMembership } from "@/lib/budget/access";
import { buildCounterBreakdowns } from "@/lib/budget/counter-breakdowns";
import { loadMonthSummary } from "@/lib/budget/load-month";
import { mapCounterBreakdownInput } from "@/lib/budget/map-counter-input";
import { parsePeriod, summaryAsOf } from "@/lib/budget/period";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
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
  const dict = await getDictionary(await getLocale());
  const tr = (path: string) => t(dict, path);
  const { workspace } = await requireMembership(workspaceSlug);
  const { year, month } = parsePeriod(sp.year, sp.month);
  const view = sp.view === "list" ? "list" : "calendar";
  const selectedDay = sp.day ? Number(sp.day) : undefined;
  const memberFilter = sp.member?.trim() || "";

  const [monthData, members] = await Promise.all([
    loadMonthSummary(workspace.id, year, month),
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
    }),
  ]);
  const { summary, incomes, expenses, charges, savings, billInstances } =
    monthData;
  const inLabel = moneyInLabel(workspace.kind);
  const breakdowns = buildCounterBreakdowns(
    mapCounterBreakdownInput({
      moneyInLabel: inLabel,
      asOf: summaryAsOf(year, month),
      incomes,
      expenses,
      charges,
      savings,
      billInstances,
    }),
  );

  const base = `/app/${workspaceSlug}/month`;
  const memberOptions = members.map((m) => ({
    userId: m.userId,
    label: m.user.name ?? m.user.email,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={tr("month.title")}
        description={tr("month.description")}
        trailing={<MonthPicker basePath={base} year={year} month={month} />}
      />

      <CounterStrip
        currency={workspace.currency}
        income={summary.totalIncome}
        spent={summary.totalSpent}
        remaining={summary.remaining}
        entryCount={summary.monthEntryCount}
        pendingBills={summary.pendingBillsCount}
        skippedBills={summary.skippedBillsCount}
        upcoming={summary.upcomingOutflow}
        expectedFunds={summary.upcomingInflow}
        moneyInLabel={inLabel}
        breakdowns={breakdowns}
      />

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
          members={memberOptions}
        />
      </Suspense>
    </div>
  );
}
