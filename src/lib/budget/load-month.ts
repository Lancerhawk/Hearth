import { cache } from "react";
import {
  calculateBudgetSummary,
  isUpcomingDate,
} from "@/lib/budget/calculations";
import { buildDayMap } from "@/lib/budget/day-map";
import {
  billAmountStatus,
  categorySelect,
  chargeAmountDate,
  creatorSelect,
  expenseAmountDate,
  savingsAmountDate,
} from "@/lib/budget/month-selects";
import { withPerfLog } from "@/lib/budget/perf-log";
import { summaryAsOf } from "@/lib/budget/period";
import { prepareMonthBudget } from "@/lib/budget/prepare-month";
import { prisma } from "@/lib/prisma";

/** Shared per-request so parallel loaders do not re-query summary parts. */
const loadSummaryParts = cache(async function loadSummaryParts(
  budgetId: string,
  year: number,
  month: number,
) {
  const [incomes, expenses, charges, savings, bills] = await Promise.all([
    prisma.incomeEntry.findMany({
      where: { budgetId },
      select: { amount: true },
    }),
    prisma.expenseEntry.findMany({
      where: { budgetId },
      ...expenseAmountDate,
    }),
    prisma.chargeEntry.findMany({
      where: { budgetId },
      ...chargeAmountDate,
    }),
    prisma.savingsEntry.findMany({
      where: { budgetId },
      ...savingsAmountDate,
    }),
    prisma.billInstance.findMany({
      where: { budgetId },
      ...billAmountStatus,
    }),
  ]);

  return calculateBudgetSummary({
    incomes,
    expenses: expenses.map((e) => ({ amount: e.amount, on: e.spentOn })),
    charges: charges.map((c) => ({ amount: c.amount, on: c.chargedOn })),
    savings: savings.map((s) => ({ amount: s.amount, on: s.savedOn })),
    bills,
    asOf: summaryAsOf(year, month),
  });
});

/** Counters only — no full entry graphs. */
export async function loadMonthSummary(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);
  const summary = await loadSummaryParts(budget.id, year, month);
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

/** Dashboard: summary + ranking rows + upcoming + recent activity. */
export async function loadDashboardMonth(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prepareMonthBudget(workspaceId, year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    summary,
    incomes,
    expenses,
    charges,
    savings,
    billInstances,
    upcoming,
  ] = await Promise.all([
    loadSummaryParts(budget.id, year, month),
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
    loadUpcomingOutflows(workspaceId, today, 10),
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
    upcoming,
  };
}

/**
 * Future-dated outflows (any month) for Upcoming on the dashboard.
 * Calendar rule: date > today is upcoming; today is already committed/done.
 * Query from start of tomorrow so noon-stamped “today” rows never slip in.
 */
export async function loadUpcomingOutflows(
  workspaceId: string,
  today: Date,
  take = 10,
) {
  const startOfTomorrow = new Date(today);
  startOfTomorrow.setHours(0, 0, 0, 0);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [expenses, charges, savings, bills] = await Promise.all([
    prisma.expenseEntry.findMany({
      where: {
        spentOn: { gte: startOfTomorrow },
        budget: { workspaceId },
      },
      include: { category: categorySelect },
      orderBy: { spentOn: "asc" },
      take,
    }),
    prisma.chargeEntry.findMany({
      where: {
        chargedOn: { gte: startOfTomorrow },
        budget: { workspaceId },
      },
      include: { category: categorySelect },
      orderBy: { chargedOn: "asc" },
      take,
    }),
    prisma.savingsEntry.findMany({
      where: {
        savedOn: { gte: startOfTomorrow },
        budget: { workspaceId },
      },
      orderBy: { savedOn: "asc" },
      take,
    }),
    prisma.billInstance.findMany({
      where: {
        status: "PENDING",
        dueDate: { gte: startOfTomorrow },
        budget: { workspaceId },
      },
      include: { recurringBill: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take,
    }),
  ]);

  return [
    ...expenses.map((e) => ({
      id: e.id,
      title: e.title,
      kind: "Expense" as const,
      amount: e.amount,
      on: e.spentOn,
      meta: e.category?.name ?? null,
    })),
    ...charges.map((c) => ({
      id: c.id,
      title: c.title,
      kind: "Charge" as const,
      amount: c.amount,
      on: c.chargedOn,
      meta: c.category?.name ?? null,
    })),
    ...savings.map((s) => ({
      id: s.id,
      title: s.title,
      kind: "Savings" as const,
      amount: s.amount,
      on: s.savedOn,
      meta: null as string | null,
    })),
    ...bills.map((b) => ({
      id: b.id,
      title: b.recurringBill.name,
      kind: "Bill" as const,
      amount: b.amount,
      on: b.dueDate,
      meta: "pending",
    })),
  ]
    .filter((row) => isUpcomingDate(row.on, today))
    .sort((a, b) => a.on.getTime() - b.on.getTime())
    .slice(0, take);
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
      expenses: full.expenses.map((e) => ({
        amount: e.amount,
        on: e.spentOn,
      })),
      charges: full.charges.map((c) => ({
        amount: c.amount,
        on: c.chargedOn,
      })),
      savings: full.savings.map((s) => ({
        amount: s.amount,
        on: s.savedOn,
      })),
      bills: full.billInstances,
      asOf: summaryAsOf(year, month),
    });

    const dayMap = buildDayMap({
      expenses: full.expenses,
      charges: full.charges,
    });

    return { budget: full, summary, dayMap };
  });
}
