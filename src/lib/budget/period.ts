import { prisma } from "@/lib/prisma";

export function currentPeriod(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function parsePeriod(
  yearRaw?: string | number | null,
  monthRaw?: string | number | null,
) {
  const now = currentPeriod();
  const year = Number(yearRaw ?? now.year);
  const month = Number(monthRaw ?? now.month);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    year < 2000 ||
    year > 2100
  ) {
    return now;
  }
  return { year, month };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Inclusive ISO date bounds for a calendar month. */
export function monthDateBounds(year: number, month: number) {
  return {
    from: `${year}-${pad2(month)}-01`,
    to: `${year}-${pad2(month)}-${pad2(daysInMonth(year, month))}`,
  };
}

/** Year/month from an entry date (local calendar). */
export function periodFromDate(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export function nextPeriod(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function monthName(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });
}

/**
 * As-of date for committed vs upcoming totals.
 * - Past month → null (everything committed)
 * - Current month → today
 * - Future month → day before month starts (everything upcoming)
 */
export function summaryAsOf(
  year: number,
  month: number,
  today = new Date(),
): Date | null {
  const cy = today.getFullYear();
  const cm = today.getMonth() + 1;
  if (year < cy || (year === cy && month < cm)) return null;
  if (year > cy || (year === cy && month > cm)) {
    return new Date(year, month - 1, 0, 12, 0, 0);
  }
  return today;
}

export async function ensureMonthlyBudget(
  workspaceId: string,
  year: number,
  month: number,
) {
  const budget = await prisma.monthlyBudget.upsert({
    where: {
      workspaceId_year_month: { workspaceId, year, month },
    },
    create: { workspaceId, year, month },
    update: {},
  });
  await generateMissingBillInstances(budget.id, workspaceId, year, month);
  return budget;
}

async function generateMissingBillInstances(
  budgetId: string,
  workspaceId: string,
  year: number,
  month: number,
) {
  const bills = await prisma.recurringBill.findMany({
    where: { workspaceId, isActive: true },
  });
  if (bills.length === 0) return;

  const existing = await prisma.billInstance.findMany({
    where: { budgetId },
    select: { recurringBillId: true },
  });
  const have = new Set(existing.map((e) => e.recurringBillId));

  const toCreate = bills
    .filter((b) => !have.has(b.id))
    .map((b) => {
      const day = Math.min(b.dayOfMonth, daysInMonth(year, month));
      return {
        recurringBillId: b.id,
        budgetId,
        amount: b.amount,
        dueDate: new Date(Date.UTC(year, month - 1, day, 12, 0, 0)),
        status: "PENDING" as const,
      };
    });

  if (toCreate.length > 0) {
    await prisma.billInstance.createMany({ data: toCreate });
  }
}
