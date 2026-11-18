import { actorLabel } from "@/lib/budget/iso-date";
import type { CounterBreakdownInput } from "@/lib/budget/counter-breakdowns";

type Creator = { name: string | null; email: string } | null | undefined;

/** Map loaded month rows into counter breakdown input. */
export function mapCounterBreakdownInput(input: {
  moneyInLabel: string;
  asOf: Date | null;
  incomes: Array<{
    id: string;
    title: string;
    amount: CounterBreakdownInput["incomes"][number]["amount"];
    earnedOn: Date;
    createdBy?: Creator;
  }>;
  expenses: Array<{
    id: string;
    title: string;
    amount: CounterBreakdownInput["expenses"][number]["amount"];
    spentOn: Date;
    category?: { name: string } | null;
    createdBy?: Creator;
  }>;
  charges: Array<{
    id: string;
    title: string;
    amount: CounterBreakdownInput["charges"][number]["amount"];
    chargedOn: Date;
    category?: { name: string } | null;
    createdBy?: Creator;
  }>;
  savings: Array<{
    id: string;
    title: string;
    amount: CounterBreakdownInput["savings"][number]["amount"];
    savedOn: Date;
    createdBy?: Creator;
  }>;
  billInstances: Array<{
    id: string;
    amount: CounterBreakdownInput["bills"][number]["amount"];
    status: "PENDING" | "PAID" | "SKIPPED";
    dueDate: Date;
    recurringBill: { name: string };
  }>;
}): CounterBreakdownInput {
  return {
    moneyInLabel: input.moneyInLabel,
    asOf: input.asOf,
    incomes: input.incomes.map((i) => ({
      id: i.id,
      title: i.title,
      amount: i.amount,
      on: i.earnedOn,
      by: actorLabel(i.createdBy),
    })),
    expenses: input.expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      on: e.spentOn,
      meta: e.category?.name ?? null,
      by: actorLabel(e.createdBy),
    })),
    charges: input.charges.map((c) => ({
      id: c.id,
      title: c.title,
      amount: c.amount,
      on: c.chargedOn,
      meta: c.category?.name ?? null,
      by: actorLabel(c.createdBy),
    })),
    savings: input.savings.map((s) => ({
      id: s.id,
      title: s.title,
      amount: s.amount,
      on: s.savedOn,
      by: actorLabel(s.createdBy),
    })),
    bills: input.billInstances.map((b) => ({
      id: b.id,
      title: b.recurringBill.name,
      amount: b.amount,
      status: b.status,
      dueDate: b.dueDate,
    })),
  };
}
