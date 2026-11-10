import type { Metadata } from "next";
import { addSavingsAction, deleteEntryAction } from "@/actions/entries";
import { EntryForm } from "@/components/entries/entry-form";
import { MonthPicker } from "@/components/budget/month-picker";
import { Button } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency } from "@/lib/money";

export const metadata: Metadata = { title: "Savings" };

export default async function SavingsPage({
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
  const action = addSavingsAction.bind(null, workspaceSlug, year, month);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Savings</h1>
          <p className="text-muted-foreground">Transfers into savings goals.</p>
        </div>
        <MonthPicker basePath={`/app/${workspaceSlug}/savings`} year={year} month={month} />
      </div>

      <EntryForm action={action} defaultDate={toIsoDate()} submitLabel="Add savings" />

      <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
        {budget.savings.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">No savings this month.</li>
        ) : (
          budget.savings.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">
                  {row.savedOn.toISOString().slice(0, 10)} · added by {actorLabel(row.createdBy)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(row.amount, workspace.currency)}</span>
                <form
                  action={async () => {
                    "use server";
                    await deleteEntryAction(workspaceSlug, "savings", row.id);
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
