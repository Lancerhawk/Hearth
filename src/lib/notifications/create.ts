import type { NotificationType } from "@/types/prisma";
import { prisma } from "@/lib/prisma";

export async function createNotification(opts: {
  userId: string;
  workspaceId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: opts.userId,
      workspaceId: opts.workspaceId ?? null,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      href: opts.href,
    },
  });
}

export async function notifyWorkspaceAdmins(opts: {
  workspaceId: string;
  excludeUserId?: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  const admins = await prisma.workspaceMembership.findMany({
    where: {
      workspaceId: opts.workspaceId,
      role: { in: ["OWNER", "ADMIN"] },
      ...(opts.excludeUserId ? { userId: { not: opts.excludeUserId } } : {}),
    },
    select: { userId: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.userId,
      workspaceId: opts.workspaceId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      href: opts.href,
    })),
  });
}
