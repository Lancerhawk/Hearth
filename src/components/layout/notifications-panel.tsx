"use client";

import Link from "next/link";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationsPanel({
  workspaceSlug,
  notifications,
}: {
  workspaceSlug: string;
  notifications: NotificationItem[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <form action={markAllNotificationsReadAction.bind(null, workspaceSlug)}>
          <Button type="submit" variant="outline" size="sm">
            Mark all read
          </Button>
        </form>
      </div>

      <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-card/70">
        {notifications.length === 0 ? (
          <li className="px-3 py-5 text-sm text-muted-foreground">
            No notifications yet.
          </li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex flex-col gap-2 px-3 py-3",
                n.readAt && "opacity-70",
              )}
            >
              <div>
                <p className="font-medium text-hearth-ink">{n.title}</p>
                {n.body ? (
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.createdAt.slice(0, 16).replace("T", " ")}
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
                <form action={markNotificationReadAction.bind(null, n.id)}>
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
