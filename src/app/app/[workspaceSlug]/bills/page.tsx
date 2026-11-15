import type { Metadata } from "next";
import {
  createRecurringBillAction,
  setBillStatusAction,
  toggleRecurringBillAction,
  updateBillInstanceAction,
  updateRecurringBillAction,
} from "@/actions/bills";
import { BillForm } from "@/components/bills/bill-form";
import {
  BillInstanceEditButton,
  RecurringBillEditButton,
} from "@/components/bills/bill-row-actions";
import { MonthPicker } from "@/components/budget/month-picker";
import { PageHeader } from "@/components/design/page-header";
import { SectionTitle } from "@/components/design/section-title";
import { Button } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Bills" };

export default async function BillsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;
  const { workspace, membership } = await requireMembership(workspaceSlug);
  const canAdmin = membership.role === "OWNER" || membership.role === "ADMIN";
  const { year, month } = parsePeriod(sp.year, sp.month);
  const { budget } = await loadMonthBudget(workspace.id, year, month);
  const templates = await prisma.recurringBill.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { dayOfMonth: "asc" },
  });
  const create = createRecurringBillAction.bind(null, workspaceSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Bills"
        description="Recurring templates and this month's instances."
        trailing={
          <MonthPicker
            basePath={`/app/${workspaceSlug}/bills`}
            year={year}
            month={month}
          />
        }
      />

      {canAdmin ? <BillForm action={create} /> : null}

      <section className="space-y-3">
        <SectionTitle>This month</SectionTitle>
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70">
          {budget.billInstances.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">
              No bill instances yet.
            </li>
          ) : (
            budget.billInstances.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{b.recurringBill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {b.dueDate.toISOString().slice(0, 10)} ·{" "}
                    {b.status.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{formatCurrency(b.amount, workspace.currency)}</span>
                  <BillInstanceEditButton
                    amount={String(toNumber(b.amount))}
                    updateAction={updateBillInstanceAction.bind(
                      null,
                      workspaceSlug,
                      b.id,
                    )}
                  />
                  {(["PENDING", "PAID", "SKIPPED"] as const).map((status) => (
                    <form
                      key={status}
                      action={async () => {
                        "use server";
                        await setBillStatusAction(workspaceSlug, b.id, status);
                      }}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant={b.status === status ? "default" : "outline"}
                      >
                        {status.toLowerCase()}
                      </Button>
                    </form>
                  ))}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionTitle>Templates</SectionTitle>
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  Day {t.dayOfMonth} ·{" "}
                  {formatCurrency(t.amount, workspace.currency)}
                  {t.isActive ? "" : " · inactive"}
                </p>
              </div>
              {canAdmin ? (
                <div className="flex flex-wrap items-center gap-1">
                  <RecurringBillEditButton
                    defaults={{
                      name: t.name,
                      amount: String(toNumber(t.amount)),
                      dayOfMonth: String(t.dayOfMonth),
                    }}
                    updateAction={updateRecurringBillAction.bind(
                      null,
                      workspaceSlug,
                      t.id,
                    )}
                  />
                  <form
                    action={async () => {
                      "use server";
                      await toggleRecurringBillAction(
                        workspaceSlug,
                        t.id,
                        !t.isActive,
                      );
                    }}
                  >
                    <Button type="submit" size="sm" variant="outline">
                      {t.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
