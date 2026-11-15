import type { Metadata } from "next";
import Link from "next/link";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { PageHeader } from "@/components/design/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireMembership, requireUser } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace } = await requireMembership(workspaceSlug);
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const markAll = markAllNotificationsReadAction.bind(null, workspaceSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Alerts"
        description="Invites, bills, and budget warnings."
        trailing={
          <form action={markAll}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        }
      />

      <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70">
        {notifications.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground">
            No notifications yet.
          </li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 ${n.readAt ? "opacity-70" : ""}`}
            >
              <div>
                <p className="font-medium">{n.title}</p>
                {n.body ? (
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </p>
                {n.href ? (
                  <Link
                    href={n.href}
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" }),
                      "px-0",
                    )}
                  >
                    Open
                  </Link>
                ) : null}
              </div>
              {!n.readAt ? (
                <form
                  action={async () => {
                    "use server";
                    await markNotificationReadAction(n.id);
                  }}
                >
                  <Button type="submit" size="sm" variant="ghost">
                    Mark read
                  </Button>
                </form>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
