import type { Metadata } from "next";
import {
  createRecurringBillAction,
  updateBillInstanceAction,
  updateRecurringBillAction,
} from "@/actions/bills";
import { BillForm } from "@/components/bills/bill-form";
import {
  BillInstanceEditButton,
  RecurringBillEditButton,
} from "@/components/bills/bill-row-actions";
import {
  BillActiveToggle,
  BillStatusButtons,
} from "@/components/bills/bill-status-buttons";
import { MonthPicker } from "@/components/budget/month-picker";
import { PageHeader } from "@/components/design/page-header";
import { SectionTitle } from "@/components/design/section-title";
import { requireMembership } from "@/lib/budget/access";
import { loadBillsForMonth } from "@/lib/budget/load-month";
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
  const { billInstances } = await loadBillsForMonth(workspace.id, year, month);
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
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_32%,white)] hearth-elevate">
          {billInstances.length === 0 ? (
            <li className="px-5 py-8 text-sm text-muted-foreground">
              No bill instances yet.
            </li>
          ) : (
            billInstances.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-hearth-ink">
                    {b.recurringBill.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Due {b.dueDate.toISOString().slice(0, 10)} ·{" "}
                    {b.status.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-lg tabular-money">
                    {formatCurrency(b.amount, workspace.currency)}
                  </span>
                  <BillInstanceEditButton
                    amount={String(toNumber(b.amount))}
                    updateAction={updateBillInstanceAction.bind(
                      null,
                      workspaceSlug,
                      b.id,
                    )}
                  />
                  <BillStatusButtons
                    workspaceSlug={workspaceSlug}
                    instanceId={b.id}
                    status={b.status}
                  />
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionTitle>Templates</SectionTitle>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_32%,white)] hearth-elevate">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-medium text-hearth-ink">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Day {t.dayOfMonth} ·{" "}
                  <span className="tabular-money">
                    {formatCurrency(t.amount, workspace.currency)}
                  </span>
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
                  <BillActiveToggle
                    workspaceSlug={workspaceSlug}
                    billId={t.id}
                    isActive={t.isActive}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
