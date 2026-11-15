import { toDateKey } from "@/lib/budget/calculations";
import { formatCurrency, toNumber, type MoneyInput } from "@/lib/money";
import type { StatementFilters, StatementKind } from "@/lib/statements/filters";

export type StatementRow = {
  date: string;
  title: string;
  category: string;
  type: string;
  /** Absolute amount */
  amount: number;
  /** +1 money in, -1 money out */
  sign: 1 | -1;
  addedBy: string;
  recordedAt: string;
  categoryId?: string | null;
  createdById?: string | null;
  billStatus?: "PENDING" | "PAID" | "SKIPPED";
};

export type StatementTotals = {
  inflow: number;
  outflow: number;
  /** inflow - outflow (pending bills excluded from outflow) */
  net: number;
  pendingOutflow: number;
  rowCount: number;
};

function actor(user?: { name: string | null; email: string } | null): string {
  return user?.name ?? user?.email ?? "—";
}

function isoDay(date: Date) {
  return toDateKey(date);
}

export function buildStatementRows(input: {
  expenses?: Array<{
    title: string;
    amount: MoneyInput;
    spentOn: Date;
    createdAt: Date;
    categoryId?: string | null;
    createdById?: string;
    category?: { name: string } | null;
    createdBy?: { name: string | null; email: string };
  }>;
  charges?: Array<{
    title: string;
    amount: MoneyInput;
    chargedOn: Date;
    createdAt: Date;
    categoryId?: string | null;
    createdById?: string;
    category?: { name: string } | null;
    createdBy?: { name: string | null; email: string };
  }>;
  incomes?: Array<{
    title: string;
    amount: MoneyInput;
    earnedOn: Date;
    createdAt: Date;
    createdById?: string;
    createdBy?: { name: string | null; email: string };
  }>;
  savings?: Array<{
    title: string;
    amount: MoneyInput;
    savedOn: Date;
    createdAt: Date;
    createdById?: string;
    createdBy?: { name: string | null; email: string };
  }>;
  bills?: Array<{
    amount: MoneyInput;
    dueDate: Date;
    status: "PENDING" | "PAID" | "SKIPPED";
    updatedAt: Date;
    recurringBill: { name: string };
  }>;
}): StatementRow[] {
  const rows: StatementRow[] = [];

  for (const e of input.expenses ?? []) {
    rows.push({
      date: isoDay(e.spentOn),
      title: e.title,
      category: e.category?.name ?? "—",
      type: "Expense",
      amount: toNumber(e.amount),
      sign: -1,
      addedBy: actor(e.createdBy),
      recordedAt: e.createdAt.toISOString(),
      categoryId: e.categoryId,
      createdById: e.createdById,
    });
  }
  for (const c of input.charges ?? []) {
    rows.push({
      date: isoDay(c.chargedOn),
      title: c.title,
      category: c.category?.name ?? "—",
      type: "Charge",
      amount: toNumber(c.amount),
      sign: -1,
      addedBy: actor(c.createdBy),
      recordedAt: c.createdAt.toISOString(),
      categoryId: c.categoryId,
      createdById: c.createdById,
    });
  }
  for (const i of input.incomes ?? []) {
    rows.push({
      date: isoDay(i.earnedOn),
      title: i.title,
      category: "Income",
      type: "Income",
      amount: toNumber(i.amount),
      sign: 1,
      addedBy: actor(i.createdBy),
      recordedAt: i.createdAt.toISOString(),
      createdById: i.createdById,
    });
  }
  for (const s of input.savings ?? []) {
    rows.push({
      date: isoDay(s.savedOn),
      title: s.title,
      category: "Savings",
      type: "Savings",
      amount: toNumber(s.amount),
      sign: -1,
      addedBy: actor(s.createdBy),
      recordedAt: s.createdAt.toISOString(),
      createdById: s.createdById,
    });
  }
  for (const b of input.bills ?? []) {
    rows.push({
      date: isoDay(b.dueDate),
      title: b.recurringBill.name,
      category: "Bill",
      type: `Bill (${b.status.toLowerCase()})`,
      amount: toNumber(b.amount),
      sign: -1,
      addedBy: "System",
      recordedAt: b.updatedAt.toISOString(),
      billStatus: b.status,
    });
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function kindAllowsType(kind: StatementKind, type: string): boolean {
  switch (kind) {
    case "full":
      return true;
    case "income":
      return type === "Income";
    case "expenses":
      return type === "Expense";
    case "charges":
      return type === "Charge";
    case "savings":
      return type === "Savings";
    case "bills":
      return type.startsWith("Bill");
    case "spent":
      return type === "Expense" || type === "Charge" || type === "Bill (paid)";
  }
}

export function applyStatementFilters(
  rows: StatementRow[],
  filters: StatementFilters,
): StatementRow[] {
  return rows.filter((row) => {
    if (!kindAllowsType(filters.kind, row.type)) return false;
    if (row.date < filters.from || row.date > filters.to) return false;
    if (filters.categoryId && row.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.member && row.createdById !== filters.member) return false;
    if (row.billStatus) {
      if (filters.kind === "spent" && row.billStatus !== "PAID") return false;
      if (filters.billStatus === "paid" && row.billStatus !== "PAID") {
        return false;
      }
      if (filters.billStatus === "pending" && row.billStatus !== "PENDING") {
        return false;
      }
      if (row.billStatus === "SKIPPED") return false;
    }
    return true;
  });
}

export function computeStatementTotals(rows: StatementRow[]): StatementTotals {
  let inflow = 0;
  let outflow = 0;
  let pendingOutflow = 0;

  for (const row of rows) {
    if (row.sign > 0) {
      inflow += row.amount;
      continue;
    }
    if (row.billStatus === "PENDING") {
      pendingOutflow += row.amount;
      continue;
    }
    outflow += row.amount;
  }

  return {
    inflow,
    outflow,
    net: inflow - outflow,
    pendingOutflow,
    rowCount: rows.length,
  };
}

export function formatSignedAmount(
  row: Pick<StatementRow, "amount" | "sign">,
  currency: string,
) {
  const value = row.sign * row.amount;
  const formatted = formatCurrency(Math.abs(value), currency);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export function statementCsv(
  rows: StatementRow[],
  currency: string,
  totals: StatementTotals,
) {
  const header = [
    "#",
    "Date",
    "Title",
    "Category",
    "Type",
    "Direction",
    "Amount",
    "Signed amount",
    "Added by",
    "Recorded at",
  ];
  const lines = rows.map((r, i) =>
    [
      i + 1,
      r.date,
      csvEscape(r.title),
      csvEscape(r.category),
      csvEscape(r.type),
      r.sign > 0 ? "in" : "out",
      r.amount.toFixed(2),
      (r.sign * r.amount).toFixed(2),
      csvEscape(r.addedBy),
      r.recordedAt,
    ].join(","),
  );
  const summary = [
    `Currency,${currency}`,
    `Inflow,${totals.inflow.toFixed(2)}`,
    `Outflow,${totals.outflow.toFixed(2)}`,
    `Net,${totals.net.toFixed(2)}`,
    `Pending bills,${totals.pendingOutflow.toFixed(2)}`,
    `Rows,${totals.rowCount}`,
  ];
  return [...summary, "", header.join(","), ...lines].join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
