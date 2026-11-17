import { cache } from "react";
import { calculateBudgetSummary } from "@/lib/budget/calculations";
import { buildDayMap } from "@/lib/budget/day-map";
import {
  amountOnly,
  billAmountStatus,
  categorySelect,
  creatorSelect,
} from "@/lib/budget/month-selects";
import { withPerfLog } from "@/lib/budget/perf-log";
import { prepareMonthBudget } from "@/lib/budget/prepare-month";
import { prisma } from "@/lib/prisma";

/** Shared per-request so parallel loaders do not re-query summary parts. */
const loadSummaryParts = cache(async function loadSummaryParts(
  budgetId: string,
) {
  const [incomes, expenses, charges, savings, bills] = await Promise.all([
    prisma.incomeEntry.findMany({
      where: { budgetId },
      ...amountOnly,
    }),
    prisma.expenseEntry.findMany({
      where: { budgetId },
      ...amountOnly,
    }),
    prisma.chargeEntry.findMany({
      where: { budgetId },
      ...amountOnly,
    }),
    prisma.savingsEntry.findMany({
      where: { budgetId },
      ...amountOnly,
    }),
    prisma.billInstance.findMany({
      where: { budgetId },
      ...billAmountStatus,
    }),
  ]);

  return calculateBudgetSummary({
    incomes,
    expenses,
    charges,
    savings,
    bills,
  });
});

/** Counters only — no full entry graphs. */
export async function loadMonthSummary(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const summary = await loadSummaryParts(budget.id);
  return {
    budgetId: budget.id,
    year: budget.year,
    month: budget.month,
    summary,
  };
}

export async function loadIncomesForMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const incomes = await prisma.incomeEntry.findMany({
    where: { budgetId: budget.id },
    include: { createdBy: creatorSelect },
    orderBy: { earnedOn: "desc" },
  });
  return { budgetId: budget.id, incomes };
}

export async function loadExpensesForMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const expenses = await prisma.expenseEntry.findMany({
    where: { budgetId: budget.id },
    include: { createdBy: creatorSelect, category: categorySelect },
    orderBy: { spentOn: "desc" },
  });
  return { budgetId: budget.id, expenses };
}

export async function loadSavingsForMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const savings = await prisma.savingsEntry.findMany({
    where: { budgetId: budget.id },
    include: { createdBy: creatorSelect },
    orderBy: { savedOn: "desc" },
  });
  return { budgetId: budget.id, savings };
}

export async function loadChargesForMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const charges = await prisma.chargeEntry.findMany({
    where: { budgetId: budget.id },
    include: { createdBy: creatorSelect, category: categorySelect },
    orderBy: { chargedOn: "desc" },
  });
  return { budgetId: budget.id, charges };
}

export async function loadBillsForMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const billInstances = await prisma.billInstance.findMany({
    where: { budgetId: budget.id },
    include: { recurringBill: true },
    orderBy: { dueDate: "asc" },
  });
  return { budgetId: budget.id, billInstances };
}

/** Dashboard: summary + chart expenses + bills + recent activity fields. */
export async function loadDashboardMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);

  const [summary, incomes, expenses, charges, savings, billInstances] =
    await Promise.all([
      loadSummaryParts(budget.id),
      prisma.incomeEntry.findMany({
        where: { budgetId: budget.id },
        include: { createdBy: creatorSelect },
        orderBy: { earnedOn: "desc" },
        take: 12,
      }),
      prisma.expenseEntry.findMany({
        where: { budgetId: budget.id },
        include: { createdBy: creatorSelect, category: categorySelect },
        orderBy: { spentOn: "desc" },
      }),
      prisma.chargeEntry.findMany({
        where: { budgetId: budget.id },
        include: { createdBy: creatorSelect },
        orderBy: { chargedOn: "desc" },
        take: 12,
      }),
      prisma.savingsEntry.findMany({
        where: { budgetId: budget.id },
        include: { createdBy: creatorSelect },
        orderBy: { savedOn: "desc" },
        take: 12,
      }),
      prisma.billInstance.findMany({
        where: { budgetId: budget.id },
        include: { recurringBill: true },
        orderBy: { dueDate: "asc" },
      }),
    ]);

  return {
    budget: {
      id: budget.id,
      year: budget.year,
      month: budget.month,
      incomes,
      expenses,
      charges,
      savings,
      billInstances,
    },
    summary,
  };
}

/** Full month graph for calendar / day map. */
export async function loadMonthBudget(
  workspaceId: string,
  year: number,
  month: number,
) {
  return withPerfLog(`loadMonthBudget ${year}-${month}`, async () => {
    const budget = await prepareMonthBudget(workspaceId, year, month);

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
  });
}
