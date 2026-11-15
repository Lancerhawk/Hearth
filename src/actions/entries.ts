"use server";

import { revalidatePath } from "next/cache";
import { requireMembership, requireUser } from "@/lib/budget/access";
import { ensureMonthlyBudget, parsePeriod } from "@/lib/budget/period";
import { createNotification } from "@/lib/notifications/create";
import { calculateBudgetSummary } from "@/lib/budget/calculations";
import { prisma } from "@/lib/prisma";
import { moneyEntrySchema } from "@/lib/validators/entries";

export type EntryActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseDate(value: string) {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function maybeBudgetLow(
  workspaceId: string,
  workspaceSlug: string,
  budgetId: string,
) {
  const budget = await prisma.monthlyBudget.findUnique({
    where: { id: budgetId },
    include: {
      incomes: true,
      expenses: true,
      charges: true,
      savings: true,
      billInstances: true,
    },
  });
  if (!budget) return;
  const summary = calculateBudgetSummary({
    incomes: budget.incomes,
    expenses: budget.expenses,
    charges: budget.charges,
    savings: budget.savings,
    bills: budget.billInstances,
  });
  if (summary.totalIncome <= 0) return;
  if (summary.remaining >= summary.totalIncome * 0.15) return;

  const members = await prisma.workspaceMembership.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      workspaceId,
      type: "BUDGET_LOW" as const,
      title: "Budget running low",
      body: `Remaining is under 15% of income for this month.`,
      href: `/app/${workspaceSlug}/dashboard`,
    })),
  });
}

export async function addExpenseAction(
  workspaceSlug: string,
  year: number,
  month: number,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const { workspace, user } = await requireMembership(workspaceSlug);
  const parsed = moneyEntrySchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || "",
    categoryId: formData.get("categoryId") || "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }
  const spentOn = parseDate(parsed.data.date);
  if (!spentOn) return { error: "Invalid date." };

  const budget = await ensureMonthlyBudget(workspace.id, year, month);
  await prisma.expenseEntry.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      spentOn,
      note: parsed.data.note || null,
      categoryId: parsed.data.categoryId || null,
      budgetId: budget.id,
      createdById: user.id,
    },
  });
  await maybeBudgetLow(workspace.id, workspaceSlug, budget.id);
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Expense added." };
}

export async function addIncomeAction(
  workspaceSlug: string,
  year: number,
  month: number,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const { workspace, user } = await requireMembership(workspaceSlug);
  const parsed = moneyEntrySchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }
  const earnedOn = parseDate(parsed.data.date);
  if (!earnedOn) return { error: "Invalid date." };
  const budget = await ensureMonthlyBudget(workspace.id, year, month);
  await prisma.incomeEntry.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      earnedOn,
      note: parsed.data.note || null,
      budgetId: budget.id,
      createdById: user.id,
    },
  });
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Income added." };
}

export async function addSavingsAction(
  workspaceSlug: string,
  year: number,
  month: number,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const { workspace, user } = await requireMembership(workspaceSlug);
  const parsed = moneyEntrySchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }
  const savedOn = parseDate(parsed.data.date);
  if (!savedOn) return { error: "Invalid date." };
  const budget = await ensureMonthlyBudget(workspace.id, year, month);
  await prisma.savingsEntry.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      savedOn,
      note: parsed.data.note || null,
      budgetId: budget.id,
      createdById: user.id,
    },
  });
  await maybeBudgetLow(workspace.id, workspaceSlug, budget.id);
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Savings logged." };
}

export async function addChargeAction(
  workspaceSlug: string,
  year: number,
  month: number,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const { workspace, user } = await requireMembership(workspaceSlug);
  const parsed = moneyEntrySchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || "",
    categoryId: formData.get("categoryId") || "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }
  const chargedOn = parseDate(parsed.data.date);
  if (!chargedOn) return { error: "Invalid date." };
  const budget = await ensureMonthlyBudget(workspace.id, year, month);
  await prisma.chargeEntry.create({
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      chargedOn,
      note: parsed.data.note || null,
      categoryId: parsed.data.categoryId || null,
      budgetId: budget.id,
      createdById: user.id,
    },
  });
  await maybeBudgetLow(workspace.id, workspaceSlug, budget.id);
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Charge added." };
}

export type EntryKind = "expense" | "income" | "savings" | "charge";

async function assertEntryInWorkspace(
  type: EntryKind,
  id: string,
  workspaceId: string,
) {
  if (type === "expense") {
    const row = await prisma.expenseEntry.findUnique({
      where: { id },
      include: { budget: { select: { workspaceId: true, id: true } } },
    });
    if (!row || row.budget.workspaceId !== workspaceId) return null;
    return row.budget.id;
  }
  if (type === "income") {
    const row = await prisma.incomeEntry.findUnique({
      where: { id },
      include: { budget: { select: { workspaceId: true, id: true } } },
    });
    if (!row || row.budget.workspaceId !== workspaceId) return null;
    return row.budget.id;
  }
  if (type === "savings") {
    const row = await prisma.savingsEntry.findUnique({
      where: { id },
      include: { budget: { select: { workspaceId: true, id: true } } },
    });
    if (!row || row.budget.workspaceId !== workspaceId) return null;
    return row.budget.id;
  }
  const row = await prisma.chargeEntry.findUnique({
    where: { id },
    include: { budget: { select: { workspaceId: true, id: true } } },
  });
  if (!row || row.budget.workspaceId !== workspaceId) return null;
  return row.budget.id;
}

export async function updateEntryAction(
  workspaceSlug: string,
  type: EntryKind,
  id: string,
  _prev: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const { workspace } = await requireMembership(workspaceSlug);
  const parsed = moneyEntrySchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || "",
    categoryId: formData.get("categoryId") || "",
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }
  const onDate = parseDate(parsed.data.date);
  if (!onDate) return { error: "Invalid date." };

  const budgetId = await assertEntryInWorkspace(type, id, workspace.id);
  if (!budgetId) return { error: "Entry not found." };

  if (type === "expense") {
    await prisma.expenseEntry.update({
      where: { id },
      data: {
        title: parsed.data.title,
        amount: parsed.data.amount,
        spentOn: onDate,
        note: parsed.data.note || null,
        categoryId: parsed.data.categoryId || null,
      },
    });
  } else if (type === "income") {
    await prisma.incomeEntry.update({
      where: { id },
      data: {
        title: parsed.data.title,
        amount: parsed.data.amount,
        earnedOn: onDate,
        note: parsed.data.note || null,
      },
    });
  } else if (type === "savings") {
    await prisma.savingsEntry.update({
      where: { id },
      data: {
        title: parsed.data.title,
        amount: parsed.data.amount,
        savedOn: onDate,
        note: parsed.data.note || null,
      },
    });
  } else {
    await prisma.chargeEntry.update({
      where: { id },
      data: {
        title: parsed.data.title,
        amount: parsed.data.amount,
        chargedOn: onDate,
        note: parsed.data.note || null,
        categoryId: parsed.data.categoryId || null,
      },
    });
  }

  if (type !== "income") {
    await maybeBudgetLow(workspace.id, workspaceSlug, budgetId);
  }
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Entry updated." };
}

export async function deleteEntryAction(
  workspaceSlug: string,
  type: EntryKind,
  id: string,
) {
  const { workspace } = await requireMembership(workspaceSlug);
  const budgetId = await assertEntryInWorkspace(type, id, workspace.id);
  if (!budgetId) return;

  if (type === "expense") await prisma.expenseEntry.delete({ where: { id } });
  if (type === "income") await prisma.incomeEntry.delete({ where: { id } });
  if (type === "savings") await prisma.savingsEntry.delete({ where: { id } });
  if (type === "charge") await prisma.chargeEntry.delete({ where: { id } });
  revalidatePath(`/app/${workspaceSlug}`, "layout");
}

export async function getPeriodFromSearch(searchParams: {
  year?: string;
  month?: string;
}) {
  return parsePeriod(searchParams.year, searchParams.month);
}

// silence unused in some builds
void requireUser;
void createNotification;
