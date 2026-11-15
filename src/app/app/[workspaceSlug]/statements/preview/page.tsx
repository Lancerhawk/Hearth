import type { Metadata } from "next";
import { PageHeader } from "@/components/design/page-header";
import { Surface } from "@/components/design/surface";
import { PrintButton } from "@/components/statements/print-button";
import { StatementFiltersForm } from "@/components/statements/statement-filters";
import { requireMembership } from "@/lib/budget/access";
import { formatCurrency } from "@/lib/money";
import {
  formatSignedAmount,
  type StatementTotals,
} from "@/lib/statements/build-rows";
import {
  parseStatementFilters,
  statementFilterSummary,
  statementKindLabel,
  statementQuery,
} from "@/lib/statements/filters";
import { loadFilteredStatement } from "@/lib/statements/load-statement";
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

  const [categories, members, { rows, totals }] = await Promise.all([
    prisma.category.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.workspaceMembership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    loadFilteredStatement(workspace.id, filters),
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
  const title = statementKindLabel(filters.kind, fundsLabel);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="no-print">
        <PageHeader
          title="Statement"
          description="Filter by type and dates, then print or download CSV. Totals use credits minus debits."
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

      <Surface
        padding="lg"
        className="statement-doc print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
      >
        <header className="mb-6 border-b border-border pb-4">
          <p className="font-heading text-4xl tracking-tight text-hearth-ink">
            Hearth
          </p>
          <p className="mt-1 text-lg">{workspace.name}</p>
          <p className="text-sm text-muted-foreground">
            {title} · {workspace.currency}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.from === filters.to
              ? filters.from
              : `${filters.from} → ${filters.to}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        </header>

        <SummaryStrip totals={totals} currency={workspace.currency} />

        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Date</th>
              <th className="py-2 pr-2">Title</th>
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2">Type</th>
              <th className="py-2 pr-2 text-right">Amount</th>
              <th className="py-2 pr-2">Added by</th>
              <th className="py-2">Recorded</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-muted-foreground">
                  Nothing matches these filters.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.type}-${row.recordedAt}-${i}`}
                  className="border-b border-border/50"
                >
                  <td className="py-2 pr-2">{i + 1}</td>
                  <td className="py-2 pr-2">{row.date}</td>
                  <td className="py-2 pr-2">{row.title}</td>
                  <td className="py-2 pr-2">{row.category}</td>
                  <td className="py-2 pr-2">{row.type}</td>
                  <td
                    className={`py-2 pr-2 text-right tabular-nums ${
                      row.sign > 0 ? "text-hearth-moss" : "text-hearth-ink"
                    }`}
                  >
                    {formatSignedAmount(row, workspace.currency)}
                  </td>
                  <td className="py-2 pr-2">{row.addedBy}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {row.recordedAt.slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={5} className="pt-4 font-medium">
                Net (in − out)
              </td>
              <td className="pt-4 text-right font-medium tabular-nums">
                {formatSignedAmount(
                  {
                    amount: Math.abs(totals.net),
                    sign: totals.net >= 0 ? 1 : -1,
                  },
                  workspace.currency,
                )}
              </td>
              <td colSpan={2} />
            </tr>
            {totals.pendingOutflow > 0 ? (
              <tr>
                <td colSpan={5} className="pt-1 text-sm text-muted-foreground">
                  Pending bills (not in net)
                </td>
                <td className="pt-1 text-right text-sm text-muted-foreground tabular-nums">
                  {formatCurrency(totals.pendingOutflow, workspace.currency)}
                </td>
                <td colSpan={2} />
              </tr>
            ) : null}
          </tfoot>
        </table>

        <p className="mt-6 text-xs text-muted-foreground print:hidden">
          CSV uses the same filters:{" "}
          <code className="text-[11px]">{statementQuery(filters)}</code>
        </p>
      </Surface>
    </div>
  );
}

function SummaryStrip({
  totals,
  currency,
}: {
  totals: StatementTotals;
  currency: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <SummaryCell label="In" value={formatCurrency(totals.inflow, currency)} />
      <SummaryCell
        label="Out"
        value={formatCurrency(totals.outflow, currency)}
      />
      <SummaryCell
        label="Net"
        value={formatSignedAmount(
          {
            amount: Math.abs(totals.net),
            sign: totals.net >= 0 ? 1 : -1,
          },
          currency,
        )}
      />
      <SummaryCell label="Rows" value={String(totals.rowCount)} />
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-lg tabular-nums text-hearth-ink">
        {value}
      </p>
    </div>
  );
}
