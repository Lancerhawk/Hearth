import type { Metadata } from "next";
import { addIncomeAction, deleteEntryAction } from "@/actions/entries";
import { EntryForm } from "@/components/entries/entry-form";
import { MonthPicker } from "@/components/budget/month-picker";
import { Button } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency } from "@/lib/money";

export const metadata: Metadata = { title: "Income" };

export default async function IncomePage({
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
  const action = addIncomeAction.bind(null, workspaceSlug, year, month);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Income</h1>
          <p className="text-muted-foreground">Paychecks and other money in.</p>
        </div>
        <MonthPicker basePath={`/app/${workspaceSlug}/income`} year={year} month={month} />
      </div>

      <EntryForm action={action} defaultDate={toIsoDate()} submitLabel="Add income" />

      <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
        {budget.incomes.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">No income this month.</li>
        ) : (
          budget.incomes.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">
                  {row.earnedOn.toISOString().slice(0, 10)} · added by {actorLabel(row.createdBy)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(row.amount, workspace.currency)}</span>
                <form
                  action={async () => {
                    "use server";
                    await deleteEntryAction(workspaceSlug, "income", row.id);
                  }}
                >
                  <Button type="submit" size="sm" variant="ghost">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
