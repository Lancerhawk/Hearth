import type { Metadata } from "next";
import Link from "next/link";
import { MonthPicker } from "@/components/budget/month-picker";
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
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Statement</h1>
          <p className="text-muted-foreground">
            Printable month report with who added each line.
          </p>
        </div>
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
      </div>

      <article className="statement-doc rounded-xl border border-border/70 bg-card p-6 print:rounded-none print:border-0 print:p-0">
        <header className="mb-6 border-b border-border pb-4">
          <p className="font-heading text-4xl tracking-tight">Hearth</p>
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
      </article>
    </div>
  );
}
