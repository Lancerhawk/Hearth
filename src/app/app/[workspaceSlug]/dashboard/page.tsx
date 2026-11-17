import type { Metadata } from "next";
import { Suspense } from "react";
import { MonthPicker } from "@/components/budget/month-picker";
import { DashboardBody } from "@/components/dashboard/dashboard-body";
import { PageHeader } from "@/components/design/page-header";
import { RouteLoadingSkeleton } from "@/components/design/route-loading";
import { requireMembership } from "@/lib/budget/access";
import { parsePeriod } from "@/lib/budget/period";

export const metadata: Metadata = { title: "Dashboard" };

export default async function WorkspaceDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const { workspace } = await requireMembership(workspaceSlug);
  const { year, month } = parsePeriod(sp.year, sp.month);
  const base = `/app/${workspaceSlug}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description={`${workspace.name} — this month at a glance.`}
        trailing={
          <MonthPicker
            basePath={`${base}/dashboard`}
            year={year}
            month={month}
          />
        }
      />

      <Suspense fallback={<RouteLoadingSkeleton variant="page" />}>
        <DashboardBody
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          currency={workspace.currency}
          workspaceKind={workspace.kind}
          year={year}
          month={month}
        />
      </Suspense>
    </div>
  );
}
