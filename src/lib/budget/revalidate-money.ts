import { revalidatePath } from "next/cache";

const moneyPages = [
  "dashboard",
  "month",
  "income",
  "expenses",
  "savings",
  "charges",
  "bills",
  "statements/preview",
] as const;

export type MoneyKind =
  "income" | "expense" | "savings" | "charge" | "bill" | "all";

const kindPages: Record<MoneyKind, readonly string[]> = {
  all: moneyPages,
  income: ["dashboard", "month", "income", "statements/preview"],
  expense: ["dashboard", "month", "expenses", "statements/preview"],
  savings: ["dashboard", "month", "savings", "statements/preview"],
  charge: ["dashboard", "month", "charges", "statements/preview"],
  bill: ["dashboard", "month", "bills", "statements/preview"],
};

/** Revalidate only the money routes that show this kind of data. */
export function revalidateMoneyPaths(
  workspaceSlug: string,
  kind: MoneyKind = "all",
) {
  const base = `/app/${workspaceSlug}`;
  for (const page of kindPages[kind]) {
    revalidatePath(`${base}/${page}`);
  }
}
