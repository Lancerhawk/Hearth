import { parsePeriod } from "@/lib/budget/period";

export const STATEMENT_KINDS = [
  "full",
  "income",
  "expenses",
  "charges",
  "savings",
  "bills",
  "spent",
] as const;

export type StatementKind = (typeof STATEMENT_KINDS)[number];

export type StatementFilters = {
  year: number;
  month: number;
  kind: StatementKind;
  from: string;
  to: string;
  categoryId: string;
  member: string;
  billStatus: "all" | "paid" | "pending";
};

export function statementKindLabel(
  kind: StatementKind,
  moneyIn = "Income",
): string {
  switch (kind) {
    case "full":
      return "Full statement";
    case "income":
      return moneyIn;
    case "expenses":
      return "Expenses";
    case "charges":
      return "Charges";
    case "savings":
      return "Savings";
    case "bills":
      return "Bills";
    case "spent":
      return "Monthly spend";
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function monthDateBounds(year: number, month: number) {
  return {
    from: `${year}-${pad2(month)}-01`,
    to: `${year}-${pad2(month)}-${pad2(daysInMonth(year, month))}`,
  };
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseStatementFilters(
  sp: Record<string, string | string[] | undefined | null>,
): StatementFilters {
  const get = (key: string) => {
    const v = sp[key];
    if (Array.isArray(v)) return v[0] ?? "";
    return v ?? "";
  };

  const { year, month } = parsePeriod(get("year"), get("month"));
  const bounds = monthDateBounds(year, month);

  const kindRaw = get("kind");
  const kind = (STATEMENT_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as StatementKind)
    : "full";

  let from = get("from");
  let to = get("to");
  if (!isIsoDate(from)) from = bounds.from;
  if (!isIsoDate(to)) to = bounds.to;
  if (from > to) {
    const swap = from;
    from = to;
    to = swap;
  }

  const billRaw = get("billStatus");
  const billStatus =
    billRaw === "paid" || billRaw === "pending" || billRaw === "all"
      ? billRaw
      : "all";

  return {
    year,
    month,
    kind,
    from,
    to,
    categoryId: get("categoryId").trim(),
    member: get("member").trim(),
    billStatus,
  };
}

export function statementQuery(
  filters: Partial<StatementFilters> & {
    year: number;
    month: number;
  },
) {
  const params = new URLSearchParams();
  params.set("year", String(filters.year));
  params.set("month", String(filters.month));
  if (filters.kind && filters.kind !== "full") params.set("kind", filters.kind);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.member) params.set("member", filters.member);
  if (filters.billStatus && filters.billStatus !== "all") {
    params.set("billStatus", filters.billStatus);
  }
  return params.toString();
}

export function statementFilterSummary(
  filters: StatementFilters,
  opts?: {
    moneyInLabel?: string;
    categoryName?: string;
    memberName?: string;
  },
): string[] {
  const chips: string[] = [
    statementKindLabel(filters.kind, opts?.moneyInLabel ?? "Income"),
    filters.from === filters.to
      ? filters.from
      : `${filters.from} → ${filters.to}`,
  ];
  if (filters.categoryId && opts?.categoryName) {
    chips.push(`Category: ${opts.categoryName}`);
  }
  if (filters.member) {
    chips.push(`Added by: ${opts?.memberName ?? "member"}`);
  }
  if (filters.kind === "bills" || filters.billStatus !== "all") {
    if (filters.billStatus === "paid") chips.push("Paid bills");
    if (filters.billStatus === "pending") chips.push("Pending bills");
  }
  return chips;
}
