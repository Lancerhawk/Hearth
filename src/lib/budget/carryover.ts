import { calculateBudgetSummary } from "@/lib/budget/calculations";
import { ensureMonthlyBudget } from "@/lib/budget/period";
import { toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const CARRYOVER_NOTE_PREFIX = "__hearth_carryover__:";

export function previousPeriod(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function carryoverNoteKey(year: number, month: number) {
  return `${CARRYOVER_NOTE_PREFIX}${year}-${String(month).padStart(2, "0")}`;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Keep a single Funds/Income row in this month equal to the previous
 * month’s remaining (income − spent). Updates or removes as needed.
 * Only heals one prior hop per call so page loads stay cheap; older
 * months settle when they are opened.
 */
export async function syncCarryoverFunds(
  workspaceId: string,
  year: number,
  month: number,
  depth = 0,
) {
  const prev = previousPeriod(year, month);
  if (depth > 1) return { amount: 0 as number, fromMonth: prev };

  const prevBudgetMeta = await prisma.monthlyBudget.findUnique({
    where: {
      workspaceId_year_month: {
        workspaceId,
        year: prev.year,
        month: prev.month,
      },
    },
    select: { id: true },
  });

  if (prevBudgetMeta && depth === 0) {
    await syncCarryoverFunds(workspaceId, prev.year, prev.month, depth + 1);
  }

  const noteKey = carryoverNoteKey(prev.year, prev.month);

  const prevBudget = await prisma.monthlyBudget.findUnique({
    where: {
      workspaceId_year_month: {
        workspaceId,
        year: prev.year,
        month: prev.month,
      },
    },
    include: {
      incomes: true,
      expenses: true,
      charges: true,
      savings: true,
      billInstances: true,
    },
  });

  const remaining = prevBudget
    ? calculateBudgetSummary({
        incomes: prevBudget.incomes,
        expenses: prevBudget.expenses,
        charges: prevBudget.charges,
        savings: prevBudget.savings,
        bills: prevBudget.billInstances,
      }).remaining
    : 0;

  const amount = Math.round(Math.max(0, remaining) * 100) / 100;

  const budget = await ensureMonthlyBudget(workspaceId, year, month);
  const existing = await prisma.incomeEntry.findFirst({
    where: { budgetId: budget.id, note: noteKey },
  });

  if (amount <= 0) {
    if (existing) {
      await prisma.incomeEntry.delete({ where: { id: existing.id } });
    }
    return { amount: 0, fromMonth: prev };
  }

  // Already settled for this month — skip the write.
  if (existing && Math.abs(toNumber(existing.amount) - amount) < 0.001) {
    return { amount, fromMonth: prev };
  }

  const owner = await prisma.workspaceMembership.findFirst({
    where: { workspaceId, role: "OWNER" },
    select: { userId: true },
  });
  const fallback = owner
    ? null
    : await prisma.workspaceMembership.findFirst({
        where: { workspaceId },
        select: { userId: true },
        orderBy: { createdAt: "asc" },
      });
  const createdById = owner?.userId ?? fallback?.userId;
  if (!createdById) return { amount: 0, fromMonth: prev };

  const title = `Brought forward · ${monthLabel(prev.year, prev.month)}`;
  const earnedOn = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));

  if (existing) {
    await prisma.incomeEntry.update({
      where: { id: existing.id },
      data: { title, amount, earnedOn },
    });
  } else {
    await prisma.incomeEntry.create({
      data: {
        title,
        amount,
        earnedOn,
        note: noteKey,
        budgetId: budget.id,
        createdById,
      },
    });
  }

  return { amount, fromMonth: prev };
}
