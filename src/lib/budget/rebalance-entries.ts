import { periodFromDate, ensureMonthlyBudget } from "@/lib/budget/period";
import { prisma } from "@/lib/prisma";

/**
 * Move money rows onto the MonthlyBudget that matches their entry date.
 * Fixes older data that was saved under the viewed month instead of spent-on month.
 */
export async function rebalanceEntriesToDateMonth(workspaceId: string) {
  const budgets = await prisma.monthlyBudget.findMany({
    where: { workspaceId },
    select: { id: true, year: true, month: true },
  });
  const byId = new Map(budgets.map((b) => [b.id, b]));

  const [expenses, incomes, savings, charges] = await Promise.all([
    prisma.expenseEntry.findMany({
      where: { budget: { workspaceId } },
      select: { id: true, spentOn: true, budgetId: true },
    }),
    prisma.incomeEntry.findMany({
      where: { budget: { workspaceId } },
      select: { id: true, earnedOn: true, budgetId: true },
    }),
    prisma.savingsEntry.findMany({
      where: { budget: { workspaceId } },
      select: { id: true, savedOn: true, budgetId: true },
    }),
    prisma.chargeEntry.findMany({
      where: { budget: { workspaceId } },
      select: { id: true, chargedOn: true, budgetId: true },
    }),
  ]);

  async function move(
    date: Date,
    budgetId: string,
    update: (targetBudgetId: string) => Promise<unknown>,
  ) {
    const want = periodFromDate(date);
    const have = byId.get(budgetId);
    if (have && have.year === want.year && have.month === want.month) return;
    const target = await ensureMonthlyBudget(
      workspaceId,
      want.year,
      want.month,
    );
    byId.set(target.id, {
      id: target.id,
      year: want.year,
      month: want.month,
    });
    await update(target.id);
  }

  for (const row of expenses) {
    await move(row.spentOn, row.budgetId, (budgetId) =>
      prisma.expenseEntry.update({
        where: { id: row.id },
        data: { budgetId },
      }),
    );
  }
  for (const row of incomes) {
    await move(row.earnedOn, row.budgetId, (budgetId) =>
      prisma.incomeEntry.update({
        where: { id: row.id },
        data: { budgetId },
      }),
    );
  }
  for (const row of savings) {
    await move(row.savedOn, row.budgetId, (budgetId) =>
      prisma.savingsEntry.update({
        where: { id: row.id },
        data: { budgetId },
      }),
    );
  }
  for (const row of charges) {
    await move(row.chargedOn, row.budgetId, (budgetId) =>
      prisma.chargeEntry.update({
        where: { id: row.id },
        data: { budgetId },
      }),
    );
  }
}
