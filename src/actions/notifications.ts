"use server";

import { revalidatePath } from "next/cache";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { requireMembership, requireUser } from "@/lib/budget/access";
import { isLocale, type Locale } from "@/i18n/config";
import { dictionaryFor, t } from "@/i18n/get-dictionary";
import { billDueBody } from "@/lib/notifications/format";
import { billAlertSourceKey } from "@/lib/notifications/source-key";
import { prisma } from "@/lib/prisma";

export type NotificationListItem = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export async function listNotificationsAction(
  workspaceSlug: string,
): Promise<NotificationListItem[]> {
  const { workspace, user } = await requireMembership(workspaceSlug);
  const rows = await prisma.notification.findMany({
    where: {
      userId: user.id,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
    orderBy: [{ createdAt: "desc" }],
    take: 80,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
      sourceKey: true,
    },
  });

  // Unread first, then newest. Collapse legacy bill dupes (same type+title).
  rows.sort((a, b) => {
    const ar = a.readAt ? 1 : 0;
    const br = b.readAt ? 1 : 0;
    if (ar !== br) return ar - br;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const seen = new Set<string>();
  const collapsed = [];
  for (const n of rows) {
    const key =
      n.sourceKey ??
      (n.type === "BILL_DUE_SOON" || n.type === "BILL_OVERDUE"
        ? `${n.type}|${n.title}`
        : n.id);
    if (seen.has(key)) continue;
    seen.add(key);
    collapsed.push(n);
    if (collapsed.length >= 50) break;
  }

  return collapsed.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    href: n.href,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationReadAction(id: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath(`/app`, "layout");
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
  const [instances, members] = await Promise.all([
    prisma.billInstance.findMany({
      where: {
        status: "PENDING",
        budget: { workspaceId },
      },
      include: { recurringBill: true },
    }),
    prisma.workspaceMembership.findMany({
      where: { workspaceId },
      select: { userId: true, user: { select: { locale: true } } },
    }),
  ]);

  for (const instance of instances) {
    const due = startOfDay(instance.dueDate);
    const days = differenceInCalendarDays(due, today);
    let type: "BILL_DUE_SOON" | "BILL_OVERDUE" | null = null;
    if (days < 0) type = "BILL_OVERDUE";
    else if (days <= 3) type = "BILL_DUE_SOON";
    if (!type) continue;

    const sourceKey = billAlertSourceKey(instance.id, type);
    const href = `/app/${workspaceSlug}/bills`;

    for (const member of members) {
      const locale: Locale = isLocale(member.user.locale)
        ? member.user.locale
        : "en";
      const dict = dictionaryFor(locale);
      const title =
        type === "BILL_OVERDUE"
          ? `${instance.recurringBill.name} · ${t(dict, "system.billOverdue")}`
          : `${instance.recurringBill.name} · ${t(dict, "system.billDueSoon")}`;
      const body = billDueBody(days, due, { locale, dict });
      await prisma.notification.upsert({
        where: {
          userId_sourceKey: {
            userId: member.userId,
            sourceKey,
          },
        },
        create: {
          userId: member.userId,
          workspaceId,
          type,
          title,
          body,
          href,
          sourceKey,
        },
        update: {
          type,
          title,
          body,
          href,
          workspaceId,
        },
      });

      // If this bill flipped to overdue, retire the due-soon twin.
      if (type === "BILL_OVERDUE") {
        await prisma.notification.updateMany({
          where: {
            userId: member.userId,
            sourceKey: billAlertSourceKey(instance.id, "BILL_DUE_SOON"),
            readAt: null,
          },
          data: { readAt: new Date() },
        });
      }
    }
  }
}
