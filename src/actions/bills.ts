"use server";

import { revalidatePath } from "next/cache";
import { requireMembership } from "@/lib/budget/access";
import { ensureMonthlyBudget } from "@/lib/budget/period";
import { prisma } from "@/lib/prisma";
import { recurringBillSchema } from "@/lib/validators/entries";

export type BillActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createRecurringBillAction(
  workspaceSlug: string,
  _prev: BillActionState,
  formData: FormData,
): Promise<BillActionState> {
  const { workspace } = await requireMembership(workspaceSlug, "ADMIN");
  const parsed = recurringBillSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  await prisma.recurringBill.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      amount: parsed.data.amount,
      dayOfMonth: parsed.data.dayOfMonth,
    },
  });

  const now = new Date();
  await ensureMonthlyBudget(
    workspace.id,
    now.getFullYear(),
    now.getMonth() + 1,
  );

  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Recurring bill added." };
}

export async function setBillStatusAction(
  workspaceSlug: string,
  instanceId: string,
  status: "PENDING" | "PAID" | "SKIPPED",
) {
  const { workspace } = await requireMembership(workspaceSlug);
  const instance = await prisma.billInstance.update({
    where: { id: instanceId },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
    include: { recurringBill: true },
  });

  if (status === "PAID" || status === "SKIPPED") {
    await prisma.notification.updateMany({
      where: {
        workspaceId: workspace.id,
        readAt: null,
        type: { in: ["BILL_DUE_SOON", "BILL_OVERDUE"] },
        title: { contains: instance.recurringBill.name },
      },
      data: { readAt: new Date() },
    });
  }

  revalidatePath(`/app/${workspaceSlug}`, "layout");
}

export async function toggleRecurringBillAction(
  workspaceSlug: string,
  billId: string,
  isActive: boolean,
) {
  await requireMembership(workspaceSlug, "ADMIN");
  await prisma.recurringBill.update({
    where: { id: billId },
    data: { isActive },
  });
  revalidatePath(`/app/${workspaceSlug}/bills`);
}

export async function updateRecurringBillAction(
  workspaceSlug: string,
  billId: string,
  _prev: BillActionState,
  formData: FormData,
): Promise<BillActionState> {
  const { workspace } = await requireMembership(workspaceSlug, "ADMIN");
  const parsed = recurringBillSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    dayOfMonth: formData.get("dayOfMonth"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const existing = await prisma.recurringBill.findFirst({
    where: { id: billId, workspaceId: workspace.id },
  });
  if (!existing) return { error: "Bill not found." };

  await prisma.recurringBill.update({
    where: { id: billId },
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      dayOfMonth: parsed.data.dayOfMonth,
    },
  });

  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Bill template updated." };
}

export async function updateBillInstanceAction(
  workspaceSlug: string,
  instanceId: string,
  _prev: BillActionState,
  formData: FormData,
): Promise<BillActionState> {
  const { workspace } = await requireMembership(workspaceSlug);
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }

  const instance = await prisma.billInstance.findFirst({
    where: {
      id: instanceId,
      budget: { workspaceId: workspace.id },
    },
  });
  if (!instance) return { error: "Bill not found." };

  await prisma.billInstance.update({
    where: { id: instanceId },
    data: { amount },
  });

  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Bill amount updated." };
}
