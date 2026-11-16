import Link from "next/link";
import { CounterStrip } from "@/components/budget/counter-strip";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { buttonVariants } from "@/components/ui/button";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadDashboardMonth } from "@/lib/budget/load-month";
import { formatCurrency, toNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { WorkspaceKind } from "@/types/prisma";
import { moneyInLabel } from "@/lib/workspace/labels";

export async function DashboardBody({
  workspaceId,
  workspaceSlug,
  currency,
  workspaceKind,
  year,
  month,
}: {
  workspaceId: string;
  workspaceSlug: string;
  currency: string;
  workspaceKind: WorkspaceKind;
  year: number;
  month: number;
}) {
  const { budget, summary } = await loadDashboardMonth(
    workspaceId,
    year,
    month,
  );
  const base = `/app/${workspaceSlug}`;
  const inLabel = moneyInLabel(workspaceKind);

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
    <>
      <Surface
        padding="lg"
        className="bg-[color-mix(in_srgb,var(--hearth-moss)_6%,var(--hearth-paper))]"
      >
        <p className="text-sm text-muted-foreground">Remaining this month</p>
        <p className="mt-1 font-heading text-5xl tracking-tight text-hearth-ink">
          {formatCurrency(summary.remaining, currency)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          of {formatCurrency(summary.totalIncome, currency)}{" "}
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
        currency={currency}
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
                    {formatCurrency(b.amount, currency)}
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
                  {formatCurrency(row.amount, currency)}
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
    </>
  );
}
