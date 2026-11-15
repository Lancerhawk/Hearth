import type { Metadata } from "next";
import Link from "next/link";
import { MonthPicker } from "@/components/budget/month-picker";
import { PageHeader } from "@/components/design/page-header";
import { Surface } from "@/components/design/surface";
import { PrintButton } from "@/components/statements/print-button";
import { buttonVariants } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency } from "@/lib/money";
import {
  buildStatementRows,
  statementTotalLabel,
} from "@/lib/statements/build-rows";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Statement" };

export default async function StatementPreviewPage({
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
  const { budget } = await loadMonthBudget(workspace.id, year, month);
  const rows = buildStatementRows({
    expenses: budget.expenses,
    charges: budget.charges,
    incomes: budget.incomes,
    savings: budget.savings,
    bills: budget.billInstances,
  });
  const base = `/app/${workspaceSlug}/statements`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="no-print">
        <PageHeader
          title="Statement"
          description="Printable month report with who added each line."
          trailing={
            <div className="flex flex-wrap items-center gap-2">
              <MonthPicker basePath={`${base}/preview`} year={year} month={month} />
              <PrintButton />
              <Link
                href={`${base}/csv?year=${year}&month=${month}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Download CSV
              </Link>
            </div>
          }
        />
      </div>

      <Surface
        padding="lg"
        className="statement-doc print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
      >
        <header className="mb-6 border-b border-border pb-4">
          <p className="font-heading text-4xl tracking-tight text-hearth-ink">Hearth</p>
          <p className="mt-1 text-lg">{workspace.name}</p>
          <p className="text-sm text-muted-foreground">
            Statement for {month}/{year} · {workspace.currency}
          </p>
        </header>

        <table className="w-full text-left text-sm">
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
                  No rows for this month.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.type}-${row.recordedAt}-${i}`} className="border-b border-border/50">
                  <td className="py-2 pr-2">{i + 1}</td>
                  <td className="py-2 pr-2">{row.date}</td>
                  <td className="py-2 pr-2">{row.title}</td>
                  <td className="py-2 pr-2">{row.category}</td>
                  <td className="py-2 pr-2">{row.type}</td>
                  <td className="py-2 pr-2 text-right">
                    {formatCurrency(row.amount, workspace.currency)}
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
            <tr>
              <td colSpan={5} className="pt-4 font-medium">
                Total of listed amounts
              </td>
              <td className="pt-4 text-right font-medium">
                {statementTotalLabel(rows, workspace.currency)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </Surface>
    </div>
  );
}
