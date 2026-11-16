"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationListItem,
} from "@/actions/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type NotificationItem = NotificationListItem;

export function NotificationsPanel({
  workspaceSlug,
  open,
}: {
  workspaceSlug: string;
  open: boolean;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startTransition(async () => {
      const rows = await listNotificationsAction(workspaceSlug);
      if (!cancelled) {
        setNotifications(rows);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <form action={markAllNotificationsReadAction.bind(null, workspaceSlug)}>
          <Button type="submit" variant="outline" size="sm">
            Mark all read
          </Button>
        </form>
      </div>

      {!loaded || pending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-full rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]"
            />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
