import type { Metadata } from "next";
import {
  addChargeAction,
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
import { loadChargesForMonth } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { formatCurrency, toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Charges" };

export default async function ChargesPage({
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
  const { charges } = await loadChargesForMonth(workspace.id, year, month);
  const categories = await prisma.category.findMany({
    where: { workspaceId: workspace.id, type: { in: ["CHARGE", "EXPENSE"] } },
    orderBy: { name: "asc" },
  });
  const action = addChargeAction.bind(null, workspaceSlug, year, month);
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Charges"
        description="Card and one-off charges for the month."
        trailing={
          <MonthPicker
            basePath={`/app/${workspaceSlug}/charges`}
            year={year}
            month={month}
          />
        }
      />

      <EntryForm
        action={action}
        categories={categoryOptions}
        defaultDate={toIsoDate()}
        showCategory
        submitLabel="Add charge"
      />

      <MoneyList
        emptyTitle="No charges this month"
        emptyDescription="Log a card swipe or one-off charge when it lands."
        items={charges.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${toIsoDate(row.chargedOn)}${row.category ? ` · ${row.category.name}` : ""}${isUpcomingDate(row.chargedOn) ? " · Upcoming" : ""} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          action: (
            <EntryRowActions
              type="charge"
              showCategory
              categories={categoryOptions}
              defaults={{
                title: row.title,
                amount: String(toNumber(row.amount)),
                date: toIsoDate(row.chargedOn),
                note: row.note ?? "",
                categoryId: row.categoryId ?? "",
              }}
              updateAction={updateEntryAction.bind(
                null,
                workspaceSlug,
                "charge",
                row.id,
              )}
              onDelete={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "charge", row.id);
              }}
            />
          ),
        }))}
      />
    </div>
  );
}
