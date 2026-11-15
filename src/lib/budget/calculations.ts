import { toNumber, type MoneyInput } from "@/lib/money";

export type MoneyRow = { amount: MoneyInput };
export type BillRow = {
  amount: MoneyInput;
  status: "PENDING" | "PAID" | "SKIPPED";
};

export function sumAmounts(rows: MoneyRow[]): number {
  return rows.reduce((acc, row) => acc + toNumber(row.amount), 0);
}

export function calculateBudgetSummary(input: {
  incomes: MoneyRow[];
  expenses: MoneyRow[];
  charges: MoneyRow[];
  savings: MoneyRow[];
  bills: BillRow[];
}) {
  const totalIncome = sumAmounts(input.incomes);
  const totalExpenses = sumAmounts(input.expenses);
  const totalCharges = sumAmounts(input.charges);
  const totalSavings = sumAmounts(input.savings);
  const paidBills = input.bills.filter((b) => b.status === "PAID");
  const pendingBills = input.bills.filter((b) => b.status === "PENDING");
  const totalPaidBills = sumAmounts(paidBills);
  const pendingBillsTotal = sumAmounts(pendingBills);

  const totalSpent =
    totalExpenses + totalCharges + totalSavings + totalPaidBills;
  const remaining = totalIncome - totalSpent;
  const projectedRemaining = remaining - pendingBillsTotal;
  const monthEntryCount = input.expenses.length + input.charges.length;

  return {
    totalIncome,
    totalExpenses,
    totalCharges,
    totalSavings,
    totalPaidBills,
    pendingBillsTotal,
    pendingBillsCount: pendingBills.length,
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

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
