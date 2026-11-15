"use server";

import { revalidatePath } from "next/cache";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { requireUser } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

export async function markNotificationReadAction(id: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
}

export async function markAllNotificationsReadAction(workspaceSlug?: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
      ...(workspaceSlug
        ? {
            OR: [{ workspace: { slug: workspaceSlug } }, { workspaceId: null }],
          }
        : {}),
    },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
  if (workspaceSlug) {
    revalidatePath(`/app/${workspaceSlug}`, "layout");
  }
}

export async function syncBillNotifications(
  workspaceId: string,
  workspaceSlug: string,
) {
  const today = startOfDay(new Date());
  const [instances, members, existingToday] = await Promise.all([
    prisma.billInstance.findMany({
      where: {
        status: "PENDING",
        budget: { workspaceId },
      },
      include: { recurringBill: true },
    }),
    prisma.workspaceMembership.findMany({
      where: { workspaceId },
      select: { userId: true },
    }),
    prisma.notification.findMany({
      where: {
        workspaceId,
        type: { in: ["BILL_DUE_SOON", "BILL_OVERDUE"] },
        createdAt: { gte: today },
      },
      select: { userId: true, type: true, title: true },
    }),
  ]);

  const seen = new Set(
    existingToday.map((n) => `${n.userId}|${n.type}|${n.title}`),
  );

  const toCreate: Array<{
    userId: string;
    workspaceId: string;
    type: "BILL_DUE_SOON" | "BILL_OVERDUE";
    title: string;
    body: string;
    href: string;
  }> = [];

  for (const instance of instances) {
    const due = startOfDay(instance.dueDate);
    const days = differenceInCalendarDays(due, today);
    let type: "BILL_DUE_SOON" | "BILL_OVERDUE" | null = null;
    if (days < 0) type = "BILL_OVERDUE";
    else if (days <= 3) type = "BILL_DUE_SOON";
    if (!type) continue;

    const title =
      type === "BILL_OVERDUE"
        ? `${instance.recurringBill.name} is overdue`
        : `${instance.recurringBill.name} due soon`;
    const body =
      type === "BILL_OVERDUE"
        ? `Was due ${Math.abs(days)} day(s) ago.`
        : `Due in ${days} day(s).`;

    for (const member of members) {
      const key = `${member.userId}|${type}|${title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      toCreate.push({
        userId: member.userId,
        workspaceId,
        type,
        title,
        body,
        href: `/app/${workspaceSlug}/bills`,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.notification.createMany({ data: toCreate });
  }
}
