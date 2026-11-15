import type { Metadata } from "next";
import {
  addIncomeAction,
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
      <PageHeader
        title="Income"
        description="Paychecks and other money in."
        trailing={
          <MonthPicker
            basePath={`/app/${workspaceSlug}/income`}
            year={year}
            month={month}
          />
        }
      />

      <EntryForm
        action={action}
        defaultDate={toIsoDate()}
        submitLabel="Add income"
      />

      <MoneyList
        emptyTitle="No income this month"
        emptyDescription="Add a paycheck or transfer to start the month."
        items={budget.incomes.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${toIsoDate(row.earnedOn)} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          action: (
            <EntryRowActions
              type="income"
              defaults={{
                title: row.title,
                amount: String(toNumber(row.amount)),
                date: toIsoDate(row.earnedOn),
                note: row.note ?? "",
              }}
              updateAction={updateEntryAction.bind(
                null,
                workspaceSlug,
                "income",
                row.id,
              )}
              onDelete={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "income", row.id);
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
