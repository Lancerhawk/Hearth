"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/design/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { href: "settings", label: "Settings" },
  ];

  const base = `/app/${workspaceSlug}`;
  const pathname = usePathname();

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
                  "rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "hearth-nav-active font-medium"
                    : "text-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
            <Link
              href="/app"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Workspaces
            </Link>
            <Link
              href={`${base}/notifications`}
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "relative gap-1.5",
              )}
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-hearth-moss px-1 py-0.5 text-[10px] leading-none text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-1.5"
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
                  "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
                    : "border-border text-muted-foreground",
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
