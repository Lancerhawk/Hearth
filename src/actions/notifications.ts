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
            OR: [
              { workspace: { slug: workspaceSlug } },
              { workspaceId: null },
            ],
          }
        : {}),
    },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
  if (workspaceSlug) {
    revalidatePath(`/app/${workspaceSlug}/notifications`);
  }
}

export async function syncBillNotifications(workspaceId: string, workspaceSlug: string) {
  const today = startOfDay(new Date());
  const instances = await prisma.billInstance.findMany({
    where: {
      status: "PENDING",
      budget: { workspaceId },
    },
    include: {
      recurringBill: true,
      budget: true,
    },
  });

  const members = await prisma.workspaceMembership.findMany({
    where: { workspaceId },
    select: { userId: true },
  });

  for (const instance of instances) {
    const due = startOfDay(instance.dueDate);
    const days = differenceInCalendarDays(due, today);
    let type: "BILL_DUE_SOON" | "BILL_OVERDUE" | null = null;
    if (days < 0) type = "BILL_OVERDUE";
    else if (days <= 3) type = "BILL_DUE_SOON";
    if (!type) continue;

    for (const member of members) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: member.userId,
          workspaceId,
          type,
          href: `/app/${workspaceSlug}/bills`,
          title: { contains: instance.recurringBill.name },
          createdAt: { gte: startOfDay(new Date()) },
        },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: member.userId,
          workspaceId,
          type,
          title:
            type === "BILL_OVERDUE"
              ? `${instance.recurringBill.name} is overdue`
              : `${instance.recurringBill.name} due soon`,
          body:
            type === "BILL_OVERDUE"
              ? `Was due ${Math.abs(days)} day(s) ago.`
              : `Due in ${days} day(s).`,
          href: `/app/${workspaceSlug}/bills`,
        },
      });
    }
  }
}
