import { toNumber, type MoneyInput } from "@/lib/money";

export type MoneyRow = { amount: MoneyInput };
export type DatedMoneyRow = MoneyRow & { on: Date };
export type BillRow = {
  amount: MoneyInput;
  status: "PENDING" | "PAID" | "SKIPPED";
  dueDate?: Date;
};

export function sumAmounts(rows: MoneyRow[]): number {
  return rows.reduce((acc, row) => acc + toNumber(row.amount), 0);
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** True when the entry date is after today (local calendar). */
export function isUpcomingDate(on: Date, today = new Date()) {
  return toDateKey(on) > toDateKey(today);
}

/** Split dated rows into committed (on ≤ asOf) vs upcoming (on > asOf). */
export function splitByAsOf(rows: DatedMoneyRow[], asOf: Date | null) {
  if (!asOf) {
    return { committed: rows, upcoming: [] as DatedMoneyRow[] };
  }
  const key = toDateKey(asOf);
  const committed: DatedMoneyRow[] = [];
  const upcoming: DatedMoneyRow[] = [];
  for (const row of rows) {
    if (toDateKey(row.on) <= key) committed.push(row);
    else upcoming.push(row);
  }
  return { committed, upcoming };
}

/**
 * Month totals.
 * - `asOf` null: every outflow is committed (past months / statements).
 * - `asOf` set: only outflows on or before that day cut Remaining; later dates are Upcoming.
 */
export function calculateBudgetSummary(input: {
  incomes: MoneyRow[];
  expenses: DatedMoneyRow[];
  charges: DatedMoneyRow[];
  savings: DatedMoneyRow[];
  bills: BillRow[];
  asOf?: Date | null;
}) {
  const asOf = input.asOf ?? null;
  const expenses = splitByAsOf(input.expenses, asOf);
  const charges = splitByAsOf(input.charges, asOf);
  const savings = splitByAsOf(input.savings, asOf);

  const totalIncome = sumAmounts(input.incomes);
  const totalExpenses = sumAmounts(expenses.committed);
  const totalCharges = sumAmounts(charges.committed);
  const totalSavings = sumAmounts(savings.committed);

  const paidBills = input.bills.filter((b) => b.status === "PAID");
  const pendingBills = input.bills.filter((b) => b.status === "PENDING");
  const skippedBills = input.bills.filter((b) => b.status === "SKIPPED");
  const totalPaidBills = sumAmounts(paidBills);

  // Pending bills due after asOf stay "upcoming obligations"; due on/before asOf stay pending-now.
  const pendingNow = asOf
    ? pendingBills.filter(
        (b) => !b.dueDate || toDateKey(b.dueDate) <= toDateKey(asOf),
      )
    : pendingBills;
  const pendingUpcoming = asOf
    ? pendingBills.filter(
        (b) => b.dueDate && toDateKey(b.dueDate) > toDateKey(asOf),
      )
    : [];

  const pendingBillsTotal = sumAmounts(pendingNow);
  const upcomingOutflow =
    sumAmounts(expenses.upcoming) +
    sumAmounts(charges.upcoming) +
    sumAmounts(savings.upcoming) +
    sumAmounts(pendingUpcoming);

  const totalSpent =
    totalExpenses + totalCharges + totalSavings + totalPaidBills;
  const remaining = totalIncome - totalSpent;
  const projectedRemaining = remaining - pendingBillsTotal - upcomingOutflow;
  const monthEntryCount =
    expenses.committed.length +
    charges.committed.length +
    expenses.upcoming.length +
    charges.upcoming.length;

  return {
    totalIncome,
    totalExpenses,
    totalCharges,
    totalSavings,
    totalPaidBills,
    pendingBillsTotal,
    /** All pending bills in this month (due now or later). */
    pendingBillsCount: pendingBills.length,
    /** Skipped bills filed under this month. */
    skippedBillsCount: skippedBills.length,
    upcomingOutflow,
    upcomingCount:
      expenses.upcoming.length +
      charges.upcoming.length +
      savings.upcoming.length +
      pendingUpcoming.length,
    totalSpent,
    remaining,
    projectedRemaining,
    monthEntryCount,
  };
}

export function daySpend(
  expenses: Array<{ amount: MoneyInput; spentOn: Date }>,
  charges: Array<{ amount: MoneyInput; chargedOn: Date }>,
  dateKey: string,
) {
  const exp = expenses.filter((e) => toDateKey(e.spentOn) === dateKey);
  const ch = charges.filter((c) => toDateKey(c.chargedOn) === dateKey);
  return {
    amount: sumAmounts(exp) + sumAmounts(ch),
    count: exp.length + ch.length,
  };
}
