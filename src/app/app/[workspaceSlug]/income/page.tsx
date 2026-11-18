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
import { isUpcomingDate } from "@/lib/budget/calculations";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadIncomesForMonth } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { formatCurrency, toNumber } from "@/lib/money";
import { moneyInLabel } from "@/lib/workspace/labels";

export const metadata: Metadata = { title: "Money in" };

export default async function IncomePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tr = (path: string) => t(dict, path);
  const { workspace } = await requireMembership(workspaceSlug);
  const { year, month } = parsePeriod(sp.year, sp.month);
  const { incomes } = await loadIncomesForMonth(workspace.id, year, month);
  const action = addIncomeAction.bind(null, workspaceSlug, year, month);
  const label = moneyInLabel(workspace.kind);
  const isIncome = label === "Income";
  const title = isIncome ? tr("money.incomeTitle") : tr("money.fundsTitle");
  const description = isIncome
    ? tr("money.incomeDescription")
    : tr("money.fundsDescription");
  const addLabel = isIncome ? tr("money.addIncome") : tr("money.addFunds");
  const emptyTitle = isIncome ? tr("money.noIncome") : tr("money.noIncome");
  const emptyBody = isIncome
    ? tr("money.noIncomeBody")
    : tr("money.noIncomeBody");
  const upcomingTag = tr("money.upcomingTag");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title={title}
        description={description}
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
        submitLabel={addLabel}
      />

      <MoneyList
        amountTone="ember"
        emptyTitle={emptyTitle}
        emptyDescription={emptyBody}
        items={incomes.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${toIsoDate(row.earnedOn)}${isUpcomingDate(row.earnedOn) ? ` · ${upcomingTag}` : ""} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency, locale),
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
