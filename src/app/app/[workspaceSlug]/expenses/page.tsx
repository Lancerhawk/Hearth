import type { Metadata } from "next";
import {
  addExpenseAction,
  deleteEntryAction,
  updateEntryAction,
} from "@/actions/entries";
import { MonthPicker } from "@/components/budget/month-picker";
import { PageHeader } from "@/components/design/page-header";
import { EntryForm } from "@/components/entries/entry-form";
import { EntryRowActions } from "@/components/entries/entry-row-actions";
import { ExpensesExplorer } from "@/components/expenses/expenses-explorer";
import { requireMembership } from "@/lib/budget/access";
import { isUpcomingDate } from "@/lib/budget/calculations";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadExpensesForMonth } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ year?: string; month?: string; member?: string }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const { workspace } = await requireMembership(workspaceSlug);
  const { year, month } = parsePeriod(sp.year, sp.month);
  const { expenses } = await loadExpensesForMonth(workspace.id, year, month);
  const categories = await prisma.category.findMany({
    where: { workspaceId: workspace.id, type: "EXPENSE" },
    orderBy: { name: "asc" },
  });
  const members = await prisma.workspaceMembership.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
  });

  const memberFilter = sp.member?.trim() || "";
  const action = addExpenseAction.bind(null, workspaceSlug, year, month);
  const base = `/app/${workspaceSlug}/expenses`;
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Expenses"
        description="Day-to-day spending with clear attribution."
        trailing={<MonthPicker basePath={base} year={year} month={month} />}
      />

      <EntryForm
        action={action}
        categories={categoryOptions}
        defaultDate={toIsoDate()}
        showCategory
        submitLabel="Add expense"
      />

      <ExpensesExplorer
        key={`${year}-${month}`}
        base={base}
        year={year}
        month={month}
        initialMember={memberFilter}
        members={members.map((m) => ({
          userId: m.userId,
          label: m.user.name ?? m.user.email,
        }))}
        items={expenses.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${toIsoDate(row.spentOn)}${row.category ? ` · ${row.category.name}` : ""}${isUpcomingDate(row.spentOn) ? " · Upcoming" : ""} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          createdById: row.createdById,
          action: (
            <EntryRowActions
              type="expense"
              showCategory
              categories={categoryOptions}
              defaults={{
                title: row.title,
                amount: String(toNumber(row.amount)),
                date: toIsoDate(row.spentOn),
                note: row.note ?? "",
                categoryId: row.categoryId ?? "",
              }}
              updateAction={updateEntryAction.bind(
                null,
                workspaceSlug,
                "expense",
                row.id,
              )}
              onDelete={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "expense", row.id);
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
