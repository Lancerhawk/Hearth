import type { Metadata } from "next";
import { Suspense } from "react";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
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
  const memberOptions = members.map((m) => ({
    userId: m.userId,
    label: m.user.name ?? m.user.email,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title="Month"
        description="See the month as a calendar or a quiet list."
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
        moneyInLabel={moneyInLabel(workspace.kind)}
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
