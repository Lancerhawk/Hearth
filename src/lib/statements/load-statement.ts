import { prisma } from "@/lib/prisma";
import {
  applyStatementFilters,
  buildStatementRows,
  computeStatementTotals,
} from "@/lib/statements/build-rows";
import type { StatementFilters } from "@/lib/statements/filters";

const creatorSelect = {
  select: { id: true, name: true, email: true },
} as const;
const categorySelect = {
  select: { id: true, name: true, color: true },
} as const;

function dayStart(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function dayEnd(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}

export async function loadFilteredStatement(
  workspaceId: string,
  filters: StatementFilters,
) {
  const from = dayStart(filters.from);
  const to = dayEnd(filters.to);

  const [expenses, charges, incomes, savings, bills] = await Promise.all([
    prisma.expenseEntry.findMany({
      where: {
        budget: { workspaceId },
        spentOn: { gte: from, lte: to },
      },
      include: { createdBy: creatorSelect, category: categorySelect },
      orderBy: { spentOn: "asc" },
    }),
    prisma.chargeEntry.findMany({
      where: {
        budget: { workspaceId },
        chargedOn: { gte: from, lte: to },
      },
      include: { createdBy: creatorSelect, category: categorySelect },
      orderBy: { chargedOn: "asc" },
    }),
    prisma.incomeEntry.findMany({
      where: {
        budget: { workspaceId },
        earnedOn: { gte: from, lte: to },
      },
      include: { createdBy: creatorSelect },
      orderBy: { earnedOn: "asc" },
    }),
    prisma.savingsEntry.findMany({
      where: {
        budget: { workspaceId },
        savedOn: { gte: from, lte: to },
      },
      include: { createdBy: creatorSelect },
      orderBy: { savedOn: "asc" },
    }),
    prisma.billInstance.findMany({
      where: {
        budget: { workspaceId },
        dueDate: { gte: from, lte: to },
        status: { not: "SKIPPED" },
      },
      include: { recurringBill: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const raw = buildStatementRows({
    expenses,
    charges,
    incomes,
    savings,
    bills,
  });
  const rows = applyStatementFilters(raw, filters);
  const totals = computeStatementTotals(rows);

  return { rows, totals };
}
