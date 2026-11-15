import type { Metadata } from "next";
import Link from "next/link";
import { CounterStrip } from "@/components/budget/counter-strip";
import { MonthPicker } from "@/components/budget/month-picker";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { PageHeader } from "@/components/design/page-header";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { buttonVariants } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import { moneyInLabel } from "@/lib/workspace/labels";

export const metadata: Metadata = { title: "Dashboard" };

export default async function WorkspaceDashboardPage({
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
  const { budget, summary } = await loadMonthBudget(workspace.id, year, month);
  const base = `/app/${workspaceSlug}`;
  const inLabel = moneyInLabel(workspace.kind);

  const categoryTotals = new Map<string, number>();
  for (const e of budget.expenses) {
    const key = e.category?.name ?? "Uncategorized";
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + toNumber(e.amount),
    );
  }
  const chartData = [...categoryTotals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const recent = [
    ...budget.expenses.map((e) => ({
      id: e.id,
      label: e.title,
      kind: "Expense",
      amount: toNumber(e.amount),
      at: e.createdAt,
      by: actorLabel(e.createdBy),
    })),
    ...budget.incomes.map((e) => ({
      id: e.id,
      label: e.title,
      kind: inLabel,
      amount: toNumber(e.amount),
      at: e.createdAt,
      by: actorLabel(e.createdBy),
    })),
    ...budget.charges.map((e) => ({
      id: e.id,
      label: e.title,
      kind: "Charge",
      amount: toNumber(e.amount),
      at: e.createdAt,
      by: actorLabel(e.createdBy),
    })),
    ...budget.savings.map((e) => ({
      id: e.id,
      label: e.title,
      kind: "Savings",
      amount: toNumber(e.amount),
      at: e.createdAt,
      by: actorLabel(e.createdBy),
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const progress =
    summary.totalIncome > 0
      ? Math.min(
          100,
          Math.round((summary.totalSpent / summary.totalIncome) * 100),
        )
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={workspace.name}
        description="Household overview"
        trailing={
          <MonthPicker
            basePath={`${base}/dashboard`}
            year={year}
            month={month}
          />
        }
      />

      <Surface
        padding="lg"
        className="bg-[color-mix(in_srgb,var(--hearth-moss)_6%,var(--hearth-paper))]"
      >
        <p className="text-sm text-muted-foreground">Remaining this month</p>
        <p className="mt-1 font-heading text-5xl tracking-tight text-hearth-ink">
          {formatCurrency(summary.remaining, workspace.currency)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          of {formatCurrency(summary.totalIncome, workspace.currency)}{" "}
          {inLabel.toLowerCase()} · {progress}% spent
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-hearth-moss transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Surface>

      <CounterStrip
        currency={workspace.currency}
        income={summary.totalIncome}
        spent={summary.totalSpent}
        remaining={summary.remaining}
        entryCount={summary.monthEntryCount}
        pendingBills={summary.pendingBillsCount}
        moneyInLabel={inLabel}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionTitle>By category</SectionTitle>
          <div className="mt-3">
            <CategoryChart data={chartData} />
          </div>
        </Surface>

        <Surface>
          <SectionTitle>Bills this month</SectionTitle>
          <ul className="mt-3 space-y-2">
            {budget.billInstances.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No recurring bills yet.
              </li>
            ) : (
              budget.billInstances.slice(0, 6).map((b) => (
                <li key={b.id} className="flex justify-between text-sm">
                  <span>
                    {b.recurringBill.name}{" "}
                    <span className="text-muted-foreground">
                      ({b.status.toLowerCase()})
                    </span>
                  </span>
                  <span className="font-medium text-hearth-ink">
                    {formatCurrency(b.amount, workspace.currency)}
                  </span>
                </li>
              ))
            )}
          </ul>
          <Link
            href={`${base}/bills`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-4",
            )}
          >
            Manage bills
          </Link>
        </Surface>
      </div>

      <Surface>
        <SectionTitle>Recent activity</SectionTitle>
        <ul className="mt-3 space-y-2">
          {recent.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              Nothing logged yet this month.
            </li>
          ) : (
            recent.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap justify-between gap-2 text-sm"
              >
                <span>
                  <span className="font-medium text-hearth-ink">
                    {row.label}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {row.kind} · {row.by}
                  </span>
                </span>
                <span className="font-heading text-hearth-ink">
                  {formatCurrency(row.amount, workspace.currency)}
                </span>
              </li>
            ))
          )}
        </ul>
      </Surface>

      <div className="flex flex-wrap gap-2">
        <Link href={`${base}/month`} className={cn(buttonVariants())}>
          Open month calendar
        </Link>
        <Link
          href={`${base}/statements/preview?year=${year}&month=${month}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Export statement
        </Link>
      </div>
    </div>
  );
}
