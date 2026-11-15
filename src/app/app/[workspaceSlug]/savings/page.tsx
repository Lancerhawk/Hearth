import type { Metadata } from "next";
import {
  addSavingsAction,
  deleteEntryAction,
  updateEntryAction,
} from "@/actions/entries";
import { MonthPicker } from "@/components/budget/month-picker";
import { MoneyList } from "@/components/design/money-list";
import { PageHeader } from "@/components/design/page-header";
import { EntryForm } from "@/components/entries/entry-form";
import { EntryRowActions } from "@/components/entries/entry-row-actions";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";

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
      <PageHeader
        title="Savings"
        description="Transfers into savings goals."
        trailing={
          <MonthPicker
            basePath={`/app/${workspaceSlug}/savings`}
            year={year}
            month={month}
          />
        }
      />

      <EntryForm
        action={action}
        defaultDate={toIsoDate()}
        submitLabel="Add savings"
      />

      <MoneyList
        emptyTitle="No savings this month"
        items={budget.savings.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${toIsoDate(row.savedOn)} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          action: (
            <EntryRowActions
              type="savings"
              defaults={{
                title: row.title,
                amount: String(toNumber(row.amount)),
                date: toIsoDate(row.savedOn),
                note: row.note ?? "",
              }}
              updateAction={updateEntryAction.bind(
                null,
                workspaceSlug,
                "savings",
                row.id,
              )}
              onDelete={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "savings", row.id);
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
