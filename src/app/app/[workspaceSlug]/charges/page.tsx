import type { Metadata } from "next";
import { addChargeAction, deleteEntryAction } from "@/actions/entries";
import { MonthPicker } from "@/components/budget/month-picker";
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
  const { budget } = await loadMonthBudget(workspace.id, year, month);
  const categories = await prisma.category.findMany({
    where: { workspaceId: workspace.id, type: { in: ["CHARGE", "EXPENSE"] } },
    orderBy: { name: "asc" },
  });
  const action = addChargeAction.bind(null, workspaceSlug, year, month);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Charges"
        description="One-off or card charges for the month."
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
        categories={categories}
        defaultDate={toIsoDate()}
        showCategory
        submitLabel="Add charge"
      />

      <MoneyList
        emptyTitle="No charges this month"
        items={budget.charges.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${row.chargedOn.toISOString().slice(0, 10)}${row.category ? ` · ${row.category.name}` : ""} · added by ${actorLabel(row.createdBy)}`,
          amount: formatCurrency(row.amount, workspace.currency),
          action: (
            <form
              action={async () => {
                "use server";
                await deleteEntryAction(workspaceSlug, "charge", row.id);
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
