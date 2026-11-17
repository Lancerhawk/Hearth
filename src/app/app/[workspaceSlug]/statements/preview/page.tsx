import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/design/page-header";
import { RouteLoadingSkeleton } from "@/components/design/route-loading";
import { PrintButton } from "@/components/statements/print-button";
import { StatementDocument } from "@/components/statements/statement-document";
import { StatementFiltersForm } from "@/components/statements/statement-filters";
import { requireMembership } from "@/lib/budget/access";
import {
  parseStatementFilters,
  statementFilterSummary,
} from "@/lib/statements/filters";
import { moneyInLabel } from "@/lib/workspace/labels";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Statement" };

export default async function StatementPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const { workspace } = await requireMembership(workspaceSlug);
  const filters = parseStatementFilters(sp);
  const fundsLabel = moneyInLabel(workspace.kind);

  const [categories, members] = await Promise.all([
    prisma.category.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const memberOptions = members.map((m) => ({
    id: m.userId,
    label: m.user.name ?? m.user.email,
  }));
  const selectedCategory = categories.find((c) => c.id === filters.categoryId);
  const selectedMember = memberOptions.find((m) => m.id === filters.member);
  const chips = statementFilterSummary(filters, {
    moneyInLabel: fundsLabel,
    categoryName: selectedCategory?.name,
    memberName: selectedMember?.label,
  });

  const base = `/app/${workspaceSlug}/statements`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="no-print">
        <PageHeader
          title="Statement"
          description="Committed activity through today — future-dated rows stay Upcoming."
          trailing={<PrintButton />}
        />
        <StatementFiltersForm
          basePath={`${base}/preview`}
          csvPath={`${base}/csv`}
          filters={filters}
          moneyInLabel={fundsLabel}
          categories={categories}
          members={memberOptions}
        />
      </div>

      <Suspense fallback={<RouteLoadingSkeleton variant="statement" />}>
        <StatementDocument
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          currency={workspace.currency}
          fundsLabel={fundsLabel}
          filters={filters}
          chips={chips}
        />
      </Suspense>
    </div>
  );
}
