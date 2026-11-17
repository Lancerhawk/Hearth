import {
  MonthExplorer,
  type MonthActivityRow,
} from "@/components/month/month-explorer";
import { actorLabel } from "@/lib/budget/iso-date";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { toNumber } from "@/lib/money";

export async function MonthBody({
  workspaceId,
  workspaceSlug,
  currency,
  year,
  month,
  view,
  selectedDay,
  memberFilter,
  base,
  members,
}: {
  workspaceId: string;
  workspaceSlug: string;
  currency: string;
  year: number;
  month: number;
  view: "calendar" | "list";
  selectedDay?: number;
  memberFilter: string;
  base: string;
  members: Array<{ userId: string; label: string }>;
}) {
  const { budget, dayMap } = await loadMonthBudget(workspaceId, year, month);

  const activity: MonthActivityRow[] = [
    ...budget.expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: toNumber(e.amount),
      date: e.spentOn.toISOString().slice(0, 10),
      kind: "Expense",
      category: e.category?.name,
      addedBy: actorLabel(e.createdBy),
      createdById: e.createdById,
    })),
    ...budget.charges.map((c) => ({
      id: c.id,
      title: c.title,
      amount: toNumber(c.amount),
      date: c.chargedOn.toISOString().slice(0, 10),
      kind: "Charge",
      category: c.category?.name,
      addedBy: actorLabel(c.createdBy),
      createdById: c.createdById,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MonthExplorer
      key={`${year}-${month}`}
      year={year}
      month={month}
      currency={currency}
      workspaceSlug={workspaceSlug}
      base={base}
      dayMap={dayMap}
      activity={activity}
      members={members}
      initialView={view}
      initialDay={selectedDay}
      initialMember={memberFilter}
    />
  );
}
