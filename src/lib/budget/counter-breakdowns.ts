import { toDateKey } from "@/lib/budget/calculations";
import { toNumber, type MoneyInput } from "@/lib/money";

export type CounterKey =
  | "funds"
  | "spent"
  | "remaining"
  | "expectedFunds"
  | "upcomingSpend"
  | "entries"
  | "billsDue"
  | "billsSkipped";

export type CounterBreakdownRow = {
  id: string;
  title: string;
  kind: string;
  date: string;
  meta?: string | null;
  amount: number;
  /** +1 money in, -1 money out */
  sign: 1 | -1;
};

export type CounterBreakdown = {
  key: CounterKey;
  title: string;
  description: string;
  total: number;
  /** Remaining uses a formula, not a sum of rows. */
  mode: "list" | "formula";
  rows: CounterBreakdownRow[];
  formula?: {
    funds: number;
    spent: number;
    remaining: number;
  };
};

export type CounterBreakdownEntry = {
  id: string;
  title: string;
  amount: MoneyInput;
  on: Date;
  meta?: string | null;
  by?: string | null;
};

export type CounterBreakdownBill = {
  id: string;
  title: string;
  amount: MoneyInput;
  status: "PENDING" | "PAID" | "SKIPPED";
  dueDate?: Date;
};

export type CounterBreakdownInput = {
  moneyInLabel: string;
  asOf: Date | null;
  incomes: CounterBreakdownEntry[];
  expenses: CounterBreakdownEntry[];
  charges: CounterBreakdownEntry[];
  savings: CounterBreakdownEntry[];
  bills: CounterBreakdownBill[];
};

function isCommitted(on: Date, asOf: Date | null) {
  if (!asOf) return true;
  return toDateKey(on) <= toDateKey(asOf);
}

function sortByDate(rows: CounterBreakdownRow[]) {
  return [...rows].sort((a, b) => a.date.localeCompare(b.date));
}

function toRow(
  item: CounterBreakdownEntry,
  kind: string,
  sign: 1 | -1,
): CounterBreakdownRow {
  const metaParts = [item.meta, item.by ? `added by ${item.by}` : null].filter(
    Boolean,
  );
  return {
    id: item.id,
    title: item.title,
    kind,
    date: toDateKey(item.on),
    meta: metaParts.length > 0 ? metaParts.join(" · ") : null,
    amount: toNumber(item.amount),
    sign,
  };
}

function sumAbs(rows: CounterBreakdownRow[]) {
  return rows.reduce((acc, r) => acc + r.amount, 0);
}

function billRow(b: CounterBreakdownBill, meta: string): CounterBreakdownRow {
  return {
    id: b.id,
    title: b.title,
    kind: "Bill",
    date: b.dueDate ? toDateKey(b.dueDate) : "",
    meta,
    amount: toNumber(b.amount),
    sign: -1,
  };
}

/**
 * Build per-card item lists that match counter totals (committed vs upcoming).
 */
export function buildCounterBreakdowns(
  input: CounterBreakdownInput,
): Record<CounterKey, CounterBreakdown> {
  const moneyIn = input.moneyInLabel;
  const asOf = input.asOf;

  const committedIncomes = input.incomes.filter((i) => isCommitted(i.on, asOf));
  const upcomingIncomes = input.incomes.filter((i) => !isCommitted(i.on, asOf));
  const committedExpenses = input.expenses.filter((e) =>
    isCommitted(e.on, asOf),
  );
  const upcomingExpenses = input.expenses.filter(
    (e) => !isCommitted(e.on, asOf),
  );
  const committedCharges = input.charges.filter((c) => isCommitted(c.on, asOf));
  const upcomingCharges = input.charges.filter((c) => !isCommitted(c.on, asOf));
  const committedSavings = input.savings.filter((s) => isCommitted(s.on, asOf));
  const upcomingSavings = input.savings.filter((s) => !isCommitted(s.on, asOf));

  const pendingBills = input.bills.filter((b) => b.status === "PENDING");
  const paidBills = input.bills.filter((b) => b.status === "PAID");
  const skippedBills = input.bills.filter((b) => b.status === "SKIPPED");

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
  const pendingNowIds = new Set(pendingNow.map((b) => b.id));

  const fundsRows = sortByDate(
    committedIncomes.map((i) => toRow(i, moneyIn, 1)),
  );
  const spentRows = sortByDate([
    ...committedExpenses.map((e) => toRow(e, "Expense", -1)),
    ...committedCharges.map((c) => toRow(c, "Charge", -1)),
    ...committedSavings.map((s) => toRow(s, "Savings", -1)),
    ...paidBills.map((b) => billRow(b, "paid")),
  ]);
  const expectedFundsRows = sortByDate(
    upcomingIncomes.map((i) => toRow(i, moneyIn, 1)),
  );
  const upcomingSpendRows = sortByDate([
    ...upcomingExpenses.map((e) => toRow(e, "Expense", -1)),
    ...upcomingCharges.map((c) => toRow(c, "Charge", -1)),
    ...upcomingSavings.map((s) => toRow(s, "Savings", -1)),
    ...pendingUpcoming.map((b) => billRow(b, "pending")),
  ]);
  const entryRows = sortByDate([
    ...input.expenses.map((e) => toRow(e, "Expense", -1)),
    ...input.charges.map((c) => toRow(c, "Charge", -1)),
  ]);
  const billsDueRows = sortByDate(
    pendingBills.map((b) =>
      billRow(b, pendingNowIds.has(b.id) ? "due now" : "upcoming"),
    ),
  );
  const billsSkippedRows = sortByDate(
    skippedBills.map((b) => billRow(b, "skipped")),
  );

  const fundsTotal = sumAbs(fundsRows);
  const spentTotal = sumAbs(spentRows);
  const remainingTotal = fundsTotal - spentTotal;

  return {
    funds: {
      key: "funds",
      title: moneyIn,
      description: `Committed ${moneyIn.toLowerCase()} so far this month.`,
      total: fundsTotal,
      mode: "list",
      rows: fundsRows,
    },
    spent: {
      key: "spent",
      title: "Spent",
      description:
        "Committed spend so far — expenses, charges, savings, paid bills.",
      total: spentTotal,
      mode: "list",
      rows: spentRows,
    },
    remaining: {
      key: "remaining",
      title: "Remaining",
      description: `${moneyIn} minus spent.`,
      total: remainingTotal,
      mode: "formula",
      rows: [],
      formula: {
        funds: fundsTotal,
        spent: spentTotal,
        remaining: remainingTotal,
      },
    },
    expectedFunds: {
      key: "expectedFunds",
      title: `Expected ${moneyIn.toLowerCase()}`,
      description: `${moneyIn} dated after today — not in totals yet.`,
      total: sumAbs(expectedFundsRows),
      mode: "list",
      rows: expectedFundsRows,
    },
    upcomingSpend: {
      key: "upcomingSpend",
      title: "Upcoming spend",
      description: "Outflows dated after today — not cut from remaining yet.",
      total: sumAbs(upcomingSpendRows),
      mode: "list",
      rows: upcomingSpendRows,
    },
    entries: {
      key: "entries",
      title: "Entries",
      description: "Expenses and charges filed this month.",
      total: entryRows.length,
      mode: "list",
      rows: entryRows,
    },
    billsDue: {
      key: "billsDue",
      title: "Bills due this month",
      description: "All pending bills for this month.",
      total: billsDueRows.length,
      mode: "list",
      rows: billsDueRows,
    },
    billsSkipped: {
      key: "billsSkipped",
      title: "Bills skipped this month",
      description: "Bills marked skipped this month.",
      total: billsSkippedRows.length,
      mode: "list",
      rows: billsSkippedRows,
    },
  };
}
