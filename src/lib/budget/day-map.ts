import { daySpend, toDateKey } from "@/lib/budget/calculations";
import { toNumber, type MoneyInput } from "@/lib/money";

type ExpenseLike = {
  id: string;
  title: string;
  amount: MoneyInput;
  spentOn: Date;
  note: string | null;
  categoryId: string | null;
  createdById: string;
  createdAt: Date;
  category?: { name: string } | null;
  createdBy?: { name: string | null; email: string };
};

type ChargeLike = {
  id: string;
  title: string;
  amount: MoneyInput;
  chargedOn: Date;
  note: string | null;
  categoryId: string | null;
  createdById: string;
  createdAt: Date;
  category?: { name: string } | null;
  createdBy?: { name: string | null; email: string };
};

export type DayEntry = {
  id: string;
  type: "expense" | "charge" | "income" | "savings" | "bill";
  title: string;
  amount: number;
  date: Date;
  categoryName?: string | null;
  createdByName?: string | null;
  createdAt: Date;
  status?: string;
};

export type DayBucket = {
  dateKey: string;
  spend: number;
  count: number;
  entries: DayEntry[];
};

export function buildDayMap(input: {
  expenses: ExpenseLike[];
  charges: ChargeLike[];
}) {
  const keys = new Set<string>();
  for (const e of input.expenses) keys.add(toDateKey(e.spentOn));
  for (const c of input.charges) keys.add(toDateKey(c.chargedOn));

  const map: Record<string, DayBucket> = {};
  for (const key of keys) {
    const spend = daySpend(input.expenses, input.charges, key);
    const entries: DayEntry[] = [
      ...input.expenses
        .filter((e) => toDateKey(e.spentOn) === key)
        .map((e) => ({
          id: e.id,
          type: "expense" as const,
          title: e.title,
          amount: toNumber(e.amount),
          date: e.spentOn,
          categoryName: e.category?.name,
          createdByName: e.createdBy?.name ?? e.createdBy?.email,
          createdAt: e.createdAt,
        })),
      ...input.charges
        .filter((c) => toDateKey(c.chargedOn) === key)
        .map((c) => ({
          id: c.id,
          type: "charge" as const,
          title: c.title,
          amount: toNumber(c.amount),
          date: c.chargedOn,
          categoryName: c.category?.name,
          createdByName: c.createdBy?.name ?? c.createdBy?.email,
          createdAt: c.createdAt,
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    map[key] = {
      dateKey: key,
      spend: spend.amount,
      count: spend.count,
      entries,
    };
  }
  return map;
}
