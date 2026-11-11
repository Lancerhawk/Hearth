import { formatCurrency, toNumber, type MoneyInput } from "@/lib/money";

export type StatementRow = {
  date: string;
  title: string;
  category: string;
  type: string;
  amount: number;
  addedBy: string;
  recordedAt: string;
};

export function buildStatementRows(input: {
  expenses?: Array<{
    title: string;
    amount: MoneyInput;
    spentOn: Date;
    createdAt: Date;
    category?: { name: string } | null;
    createdBy?: { name: string | null; email: string };
  }>;
  charges?: Array<{
    title: string;
    amount: MoneyInput;
    chargedOn: Date;
    createdAt: Date;
    category?: { name: string } | null;
    createdBy?: { name: string | null; email: string };
  }>;
  incomes?: Array<{
    title: string;
    amount: MoneyInput;
    earnedOn: Date;
    createdAt: Date;
    createdBy?: { name: string | null; email: string };
  }>;
  savings?: Array<{
    title: string;
    amount: MoneyInput;
    savedOn: Date;
    createdAt: Date;
    createdBy?: { name: string | null; email: string };
  }>;
  bills?: Array<{
    amount: MoneyInput;
    dueDate: Date;
    status: string;
    updatedAt: Date;
    recurringBill: { name: string };
  }>;
}): StatementRow[] {
  const rows: StatementRow[] = [];

  for (const e of input.expenses ?? []) {
    rows.push({
      date: e.spentOn.toISOString().slice(0, 10),
      title: e.title,
      category: e.category?.name ?? "—",
      type: "Expense",
      amount: toNumber(e.amount),
      addedBy: e.createdBy?.name ?? e.createdBy?.email ?? "—",
      recordedAt: e.createdAt.toISOString(),
    });
  }
  for (const c of input.charges ?? []) {
    rows.push({
      date: c.chargedOn.toISOString().slice(0, 10),
      title: c.title,
      category: c.category?.name ?? "—",
      type: "Charge",
      amount: toNumber(c.amount),
      addedBy: c.createdBy?.name ?? c.createdBy?.email ?? "—",
      recordedAt: c.createdAt.toISOString(),
    });
  }
  for (const i of input.incomes ?? []) {
    rows.push({
      date: i.earnedOn.toISOString().slice(0, 10),
      title: i.title,
      category: "Income",
      type: "Income",
      amount: toNumber(i.amount),
      addedBy: i.createdBy?.name ?? i.createdBy?.email ?? "—",
      recordedAt: i.createdAt.toISOString(),
    });
  }
  for (const s of input.savings ?? []) {
    rows.push({
      date: s.savedOn.toISOString().slice(0, 10),
      title: s.title,
      category: "Savings",
      type: "Savings",
      amount: toNumber(s.amount),
      addedBy: s.createdBy?.name ?? s.createdBy?.email ?? "—",
      recordedAt: s.createdAt.toISOString(),
    });
  }
  for (const b of input.bills ?? []) {
    rows.push({
      date: b.dueDate.toISOString().slice(0, 10),
      title: b.recurringBill.name,
      category: "Bill",
      type: `Bill (${b.status.toLowerCase()})`,
      amount: toNumber(b.amount),
      addedBy: "System",
      recordedAt: b.updatedAt.toISOString(),
    });
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export function statementCsv(rows: StatementRow[], currency: string) {
  const header = [
    "#",
    "Date",
    "Title",
    "Category",
    "Type",
    "Amount",
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
      r.amount.toFixed(2),
      csvEscape(r.addedBy),
      r.recordedAt,
    ].join(","),
  );
  return [`Currency,${currency}`, header.join(","), ...lines].join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function statementTotalLabel(rows: StatementRow[], currency: string) {
  const total = rows.reduce((acc, r) => acc + r.amount, 0);
  return formatCurrency(total, currency);
}
