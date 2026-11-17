import Link from "next/link";
import { CounterStrip } from "@/components/budget/counter-strip";
import { TopSpendRanking } from "@/components/dashboard/top-spend-ranking";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { buttonVariants } from "@/components/ui/button";
import { actorLabel, toIsoDate } from "@/lib/budget/iso-date";
import { toDateKey } from "@/lib/budget/calculations";
import { loadDashboardMonth } from "@/lib/budget/load-month";
import { summaryAsOf } from "@/lib/budget/period";
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
  const { budget, summary, upcoming } = await loadDashboardMonth(
    workspaceId,
    year,
    month,
  );
  const base = `/app/${workspaceSlug}`;
  const inLabel = moneyInLabel(workspaceKind);
  const asOf = summaryAsOf(year, month);
  const asOfKey = asOf ? toDateKey(asOf) : null;
  const isCommitted = (on: Date) => !asOfKey || toDateKey(on) <= asOfKey;

  // Ranking uses committed spend only (date ≤ as-of).
  const categoryTotals = new Map<string, number>();
  for (const e of budget.expenses) {
    if (!isCommitted(e.spentOn)) continue;
    const key = e.category?.name ?? "Uncategorized";
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + toNumber(e.amount),
    );
  }
  for (const c of budget.charges) {
    if (!isCommitted(c.chargedOn)) continue;
    const key = "Charges";
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + toNumber(c.amount),
    );
  }
  const ranking = [...categoryTotals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const recent = [
    ...budget.expenses
      .filter((e) => isCommitted(e.spentOn))
      .map((e) => ({
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
    ...budget.charges
      .filter((c) => isCommitted(c.chargedOn))
      .map((c) => ({
        id: c.id,
        label: c.title,
        kind: "Charge",
        amount: toNumber(c.amount),
        at: c.createdAt,
        by: actorLabel(c.createdBy),
      })),
    ...budget.savings
      .filter((s) => isCommitted(s.savedOn))
      .map((s) => ({
        id: s.id,
        label: s.title,
        kind: "Savings",
        amount: toNumber(s.amount),
        at: s.createdAt,
        by: actorLabel(s.createdBy),
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
    <div className="flex flex-col gap-8">
      <Surface tone="emphasis" padding="lg">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-hearth-moss">
          Remaining available
        </p>
        <p className="mt-2 font-heading text-5xl tracking-tight text-hearth-ink tabular-money md:text-6xl">
          {formatCurrency(summary.remaining, currency)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-hearth-ink/60">
          of {formatCurrency(summary.totalIncome, currency)}{" "}
          {inLabel.toLowerCase()} · {progress}% spent so far
          {summary.upcomingOutflow > 0
            ? ` · ${formatCurrency(summary.upcomingOutflow, currency)} upcoming`
            : ""}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--hearth-moss)_12%,white)]">
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
        upcoming={summary.upcomingOutflow}
        moneyInLabel={inLabel}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface tone="quiet">
          <SectionTitle>Top spend this month</SectionTitle>
          <p className="mt-1 text-xs text-hearth-ink/50">
            Committed so far — future-dated rows stay under Upcoming.
          </p>
          <div className="mt-4">
            <TopSpendRanking
              rows={ranking}
              currency={currency}
              totalSpent={summary.totalSpent}
            />
          </div>
        </Surface>

        <Surface tone="quiet">
          <SectionTitle>Upcoming</SectionTitle>
          <p className="mt-1 text-xs text-hearth-ink/50">
            Dated after today — not cut from remaining yet.
          </p>
          <ul className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <li className="text-sm text-hearth-ink/55">
                Nothing scheduled ahead.
              </li>
            ) : (
              upcoming.map((row) => (
                <li
                  key={`${row.kind}-${row.id}`}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-hearth-ink">
                      {row.title}
                    </span>
                    <span className="text-hearth-ink/50">
                      {" "}
                      · {row.kind.toLowerCase()} · {toIsoDate(row.on)}
                      {row.meta ? ` · ${row.meta}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-heading tabular-money text-hearth-ink">
                    {formatCurrency(toNumber(row.amount), currency)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface tone="quiet">
          <SectionTitle>Bills this month</SectionTitle>
          <ul className="mt-4 space-y-3">
            {budget.billInstances.length === 0 ? (
              <li className="text-sm text-hearth-ink/55">
                No recurring bills yet.
              </li>
            ) : (
              budget.billInstances.slice(0, 6).map((b) => (
                <li key={b.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium text-hearth-ink">
                      {b.recurringBill.name}
                    </span>
                    <span className="text-hearth-ink/50">
                      {" "}
                      · {b.status.toLowerCase()}
                    </span>
                  </span>
                  <span className="shrink-0 font-heading tabular-money text-hearth-ink">
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
              "mt-5",
            )}
          >
            Manage bills
          </Link>
        </Surface>

        <Surface tone="quiet">
          <SectionTitle>Recent activity</SectionTitle>
          <ul className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <li className="text-sm text-hearth-ink/55">
                Nothing committed this month yet.
              </li>
            ) : (
              recent.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap justify-between gap-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-hearth-ink">
                      {row.label}
                    </span>
                    <span className="text-hearth-ink/50">
                      {" "}
                      · {row.kind} · {row.by}
                    </span>
                  </span>
                  <span className="font-heading tabular-money text-hearth-ink">
                    {formatCurrency(row.amount, currency)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Surface>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`${base}/month`}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Open month calendar
        </Link>
        <Link
          href={`${base}/statements/preview?year=${year}&month=${month}`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Export statement
        </Link>
      </div>
    </div>
  );
}
