"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/design/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const headerBtn =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-transparent px-2.5 text-sm text-hearth-ink transition-colors duration-150 hover:border-hearth-moss/45 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] hover:text-hearth-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hearth-moss/40";

export function WorkspaceShell({
  workspaceSlug,
  workspaceName,
  unreadCount,
  moneyInLabel = "Funds",
  children,
}: {
  workspaceSlug: string;
  workspaceName: string;
  unreadCount: number;
  moneyInLabel?: string;
  children: React.ReactNode;
}) {
  const links = [
    { href: "dashboard", label: "Dashboard" },
    { href: "month", label: "Month" },
    { href: "income", label: moneyInLabel },
    { href: "expenses", label: "Expenses" },
    { href: "savings", label: "Savings" },
    { href: "charges", label: "Charges" },
    { href: "bills", label: "Bills" },
    { href: "members", label: "Members" },
    { href: "categories", label: "Categories" },
    { href: "statements/preview", label: "Statement" },
  ];

  const base = `/app/${workspaceSlug}`;
  const pathname = usePathname();
  const settingsActive =
    pathname === `${base}/settings` || pathname.startsWith(`${base}/settings/`);
  const notificationsActive =
    pathname === `${base}/notifications` ||
    pathname.startsWith(`${base}/notifications/`);

  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/90 p-5 md:flex">
        <div className="shrink-0">
          <BrandMark href={`${base}/dashboard`} size="md" />
        </div>
        <nav className="mt-7 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1">
          {links.map((link) => {
            const href = `${base}/${link.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={link.href}
                href={href}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                  active
                    ? "hearth-nav-active font-medium"
                    : "text-foreground/75 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))] hover:text-hearth-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_92%,white)] px-4 py-3 backdrop-blur-sm md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
              <BrandMark href={`${base}/dashboard`} size="sm" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg tracking-tight text-hearth-ink">
                {workspaceName}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Current workspace
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/app" className={headerBtn}>
              Workspaces
            </Link>
            <Link
              href={`${base}/notifications`}
              title="Notifications"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              className={cn(
                headerBtn,
                "relative size-8 px-0",
                notificationsActive &&
                  "border-hearth-moss/50 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))]",
              )}
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-hearth-moss px-1 py-0.5 text-[10px] leading-none text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={`${base}/settings`}
              title="Settings"
              aria-label="Settings"
              className={cn(
                headerBtn,
                "size-8 px-0",
                settingsActive &&
                  "border-hearth-moss/50 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))]",
              )}
            >
              <Settings className="size-4" />
            </Link>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className={cn(
                  headerBtn,
                  "border-transparent hover:border-hearth-moss/45",
                )}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-border/60 px-3 py-2 md:hidden">
          {links.map((link) => {
            const href = `${base}/${link.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={link.href}
                href={href}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors duration-150",
                  active
                    ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
                    : "border-border text-muted-foreground hover:border-hearth-moss/40 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))] hover:text-hearth-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <main className="hearth-enter flex-1 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
