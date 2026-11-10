import type { Metadata } from "next";
import Link from "next/link";
import { addExpenseAction, deleteEntryAction } from "@/actions/entries";
import { EntryForm } from "@/components/entries/entry-form";
import { MonthPicker } from "@/components/budget/month-picker";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Day-to-day spending with attribution.</p>
        </div>
        <MonthPicker basePath={base} year={year} month={month} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`${base}?year=${year}&month=${month}`}
          className={`rounded-full border px-3 py-1 text-xs ${!memberFilter ? "border-primary bg-accent" : "border-border"}`}
        >
          Everyone
        </Link>
        {members.map((m) => (
          <Link
            key={m.userId}
            href={`${base}?year=${year}&month=${month}&member=${m.userId}`}
            className={`rounded-full border px-3 py-1 text-xs ${memberFilter === m.userId ? "border-primary bg-accent" : "border-border"}`}
          >
            {m.user.name ?? m.user.email}
          </Link>
        ))}
      </div>

      <EntryForm
        action={action}
        categories={categories}
        defaultDate={toIsoDate()}
        showCategory
        submitLabel="Add expense"
      />

      <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
        {rows.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">No expenses this month.</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">
                  {row.spentOn.toISOString().slice(0, 10)}
                  {row.category ? ` · ${row.category.name}` : ""}
                  {" · "}added by {actorLabel(row.createdBy)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(row.amount, workspace.currency)}</span>
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
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
