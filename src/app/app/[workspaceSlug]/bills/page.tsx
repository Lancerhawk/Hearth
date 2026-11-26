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
import { EmptyHint } from "@/components/design/empty-hint";
import { PageHeader } from "@/components/design/page-header";
import { QuietList, QuietListItem } from "@/components/design/quiet-list";
import { SectionTitle } from "@/components/design/section-title";
import { requireMembership } from "@/lib/budget/access";
import { loadBillsForMonth } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
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
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tr = (path: string, vars?: Record<string, string | number>) =>
    t(dict, path, vars);
  const { workspace, membership } = await requireMembership(workspaceSlug);
  const canAdmin = membership.role === "OWNER" || membership.role === "ADMIN";
  const { year, month } = parsePeriod(sp.year, sp.month);
  const { billInstances } = await loadBillsForMonth(workspace.id, year, month);
  const templates = await prisma.recurringBill.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { dayOfMonth: "asc" },
  });
  const create = createRecurringBillAction.bind(null, workspaceSlug);
  const statusLabel = (status: string) => {
    if (status === "PENDING") return tr("bills.pending");
    if (status === "PAID") return tr("bills.paid");
    if (status === "SKIPPED") return tr("bills.skipped");
    return status.toLowerCase();
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title={tr("bills.title")}
        description={tr("bills.description")}
        trailing={
          <MonthPicker
            basePath={`/app/${workspaceSlug}/bills`}
            year={year}
            month={month}
          />
        }
      />

      {canAdmin ? (
        <BillForm action={create} submitLabel={tr("bills.add")} />
      ) : null}

      <section className="space-y-3">
        <SectionTitle>{tr("bills.thisMonth")}</SectionTitle>
        {billInstances.length === 0 ? (
          <EmptyHint
            title={tr("bills.noBillsThisMonth")}
            description={tr("bills.noBillsThisMonthBody")}
          />
        ) : (
          <QuietList>
            {billInstances.map((b) => (
              <QuietListItem key={b.id}>
                <div>
                  <p className="font-medium text-hearth-ink">
                    {b.recurringBill.name}
                  </p>
                  <p className="mt-0.5 text-xs text-hearth-ink/55">
                    {tr("bills.due", {
                      date: b.dueDate.toISOString().slice(0, 10),
                    })}{" "}
                    · {statusLabel(b.status)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-lg tabular-money text-hearth-ink">
                    {formatCurrency(b.amount, workspace.currency, locale)}
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
              </QuietListItem>
            ))}
          </QuietList>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle>{tr("bills.templates")}</SectionTitle>
        {templates.length === 0 ? (
          <EmptyHint
            title={tr("bills.empty")}
            description={tr("bills.emptyBody")}
          />
        ) : (
          <QuietList>
            {templates.map((bill) => (
              <QuietListItem key={bill.id}>
                <div>
                  <p className="font-medium text-hearth-ink">{bill.name}</p>
                  <p className="mt-0.5 text-xs text-hearth-ink/55">
                    {tr("bills.day", { day: bill.dayOfMonth })} ·{" "}
                    <span className="tabular-money">
                      {formatCurrency(bill.amount, workspace.currency, locale)}
                    </span>
                    {bill.isActive ? "" : ` · ${tr("bills.inactive")}`}
                  </p>
                </div>
                {canAdmin ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <RecurringBillEditButton
                      defaults={{
                        name: bill.name,
                        amount: String(toNumber(bill.amount)),
                        dayOfMonth: String(bill.dayOfMonth),
                      }}
                      updateAction={updateRecurringBillAction.bind(
                        null,
                        workspaceSlug,
                        bill.id,
                      )}
                    />
                    <BillActiveToggle
                      workspaceSlug={workspaceSlug}
                      billId={bill.id}
                      isActive={bill.isActive}
                    />
                  </div>
                ) : null}
              </QuietListItem>
            ))}
          </QuietList>
        )}
      </section>
    </div>
  );
}
