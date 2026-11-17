"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationListItem,
} from "@/actions/notifications";
import { QuietList, QuietListItem } from "@/components/design/quiet-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAlertedAt } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";

export type NotificationItem = NotificationListItem;

export function NotificationsPanel({
  workspaceSlug,
  open,
}: {
  workspaceSlug: string;
  open: boolean;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, startLoading] = useTransition();
  const [marking, startMarking] = useTransition();

  function reload(soft = true) {
    startLoading(async () => {
      const rows = await listNotificationsAction(workspaceSlug);
      setNotifications(rows);
      setLoaded(true);
      void soft;
    });
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    startLoading(async () => {
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

  function markOne(id: string) {
    const prev = notifications;
    setNotifications((rows) =>
      rows.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    startMarking(async () => {
      try {
        await markNotificationReadAction(id);
        router.refresh();
        reload();
      } catch {
        setNotifications(prev);
      }
    });
  }

  function markAll() {
    const prev = notifications;
    const now = new Date().toISOString();
    setNotifications((rows) =>
      rows.map((n) => ({ ...n, readAt: n.readAt ?? now })),
    );
    startMarking(async () => {
      try {
        await markAllNotificationsReadAction(workspaceSlug);
        router.refresh();
        reload();
      } catch {
        setNotifications(prev);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={marking || !notifications.some((n) => !n.readAt)}
          onClick={markAll}
        >
          {marking ? "Updating…" : "Mark all read"}
        </Button>
      </div>

      {!loaded || loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-full rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-[color-mix(in_srgb,var(--hearth-paper)_45%,white)] px-4 py-8 text-center text-sm text-hearth-ink/55">
          No alerts yet — invites, bills, and budget notes will land here.
        </p>
      ) : (
        <QuietList>
          {notifications.map((n) => (
            <QuietListItem
              key={n.id}
              className={cn(
                "flex-col items-stretch gap-2",
                n.readAt && "opacity-70",
              )}
            >
              <div>
                <p className="font-medium text-hearth-ink">{n.title}</p>
                {n.body ? (
                  <p className="mt-0.5 text-sm text-hearth-ink/60">{n.body}</p>
                ) : null}
                <p className="mt-1 text-xs text-hearth-ink/45">
                  {formatAlertedAt(n.createdAt)}
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
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="self-start"
                  disabled={marking}
                  onClick={() => markOne(n.id)}
                >
                  Mark read
                </Button>
              ) : null}
            </QuietListItem>
          ))}
        </QuietList>
      )}
    </div>
  );
}
