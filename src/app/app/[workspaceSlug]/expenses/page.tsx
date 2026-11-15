import type { Metadata } from "next";
import { addExpenseAction, deleteEntryAction } from "@/actions/entries";
import { MonthPicker } from "@/components/budget/month-picker";
import { FilterChip } from "@/components/design/filter-chip";
import { MoneyList } from "@/components/design/money-list";
import { PageHeader } from "@/components/design/page-header";
import { EntryForm } from "@/components/entries/entry-form";
import { Button } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency } from "@/lib/money";
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
  const { budget } = await loadMonthBudget(workspace.id, year, month);
  const categories = await prisma.category.findMany({
    where: { workspaceId: workspace.id, type: "EXPENSE" },
    orderBy: { name: "asc" },
  });
  const members = await prisma.workspaceMembership.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
  });

  const memberFilter = sp.member?.trim() || "";
  const rows = memberFilter
    ? budget.expenses.filter((e) => e.createdById === memberFilter)
    : budget.expenses;

  const action = addExpenseAction.bind(null, workspaceSlug, year, month);
  const base = `/app/${workspaceSlug}/expenses`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Expenses"
        description="Day-to-day spending with attribution."
        trailing={<MonthPicker basePath={base} year={year} month={month} />}
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip
          href={`${base}?year=${year}&month=${month}`}
          active={!memberFilter}
        >
          Everyone
        </FilterChip>
        {members.map((m) => (
          <FilterChip
            key={m.userId}
            href={`${base}?year=${year}&month=${month}&member=${m.userId}`}
            active={memberFilter === m.userId}
          >
            {m.user.name ?? m.user.email}
          </FilterChip>
        ))}
      </div>

      <EntryForm
        action={action}
        categories={categories}
        defaultDate={toIsoDate()}
        showCategory
        submitLabel="Add expense"
      />

      <MoneyList
        emptyTitle="No expenses this month"
        emptyDescription="Log a purchase to see it here with who added it."
        items={rows.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${row.spentOn.toISOString().slice(0, 10)}${row.category ? ` · ${row.category.name}` : ""} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          action: (
            <form
              action={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "expense", row.id);
              }}
            >
              <Button type="submit" size="sm" variant="ghost">
                Delete
              </Button>
            </form>
          ),
        }))}
      />
    </div>
  );
}
