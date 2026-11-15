import { calculateBudgetSummary } from "@/lib/budget/calculations";
import { buildDayMap } from "@/lib/budget/day-map";
import { ensureMonthlyBudget } from "@/lib/budget/period";
import { prisma } from "@/lib/prisma";

const creatorSelect = {
  select: { id: true, name: true, email: true },
} as const;
const categorySelect = {
  select: { id: true, name: true, color: true },
} as const;

export async function loadMonthBudget(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await ensureMonthlyBudget(workspaceId, year, month);

  const full = await prisma.monthlyBudget.findUniqueOrThrow({
    where: { id: budget.id },
    include: {
      incomes: {
        include: { createdBy: creatorSelect },
        orderBy: { earnedOn: "desc" },
      },
      expenses: {
        include: { createdBy: creatorSelect, category: categorySelect },
        orderBy: { spentOn: "desc" },
      },
      charges: {
        include: { createdBy: creatorSelect, category: categorySelect },
        orderBy: { chargedOn: "desc" },
      },
      savings: {
        include: { createdBy: creatorSelect },
        orderBy: { savedOn: "desc" },
      },
      billInstances: {
        include: { recurringBill: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  const summary = calculateBudgetSummary({
    incomes: full.incomes,
    expenses: full.expenses,
    charges: full.charges,
    savings: full.savings,
    bills: full.billInstances,
  });

  const dayMap = buildDayMap({
    expenses: full.expenses,
    charges: full.charges,
  });

  return { budget: full, summary, dayMap };
}
