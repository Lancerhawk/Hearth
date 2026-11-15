"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    { href: "notifications", label: "Alerts" },
    { href: "statements/preview", label: "Statement" },
    { href: "settings", label: "Settings" },
  ];

  const base = `/app/${workspaceSlug}`;
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar/90 p-5 md:flex md:flex-col">
        <BrandMark href={`${base}/dashboard`} size="md" />
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {workspaceName}
        </p>
        <nav className="mt-7 flex flex-1 flex-col gap-0.5">
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
                {link.href === "notifications" && unreadCount > 0 ? (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-hearth-moss px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-2 border-t border-sidebar-border pt-4">
          <Link
            href="/app"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
          >
            Workspaces
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 md:hidden">
          <div>
            <BrandMark href={`${base}/dashboard`} size="sm" />
            <p className="text-xs text-muted-foreground">{workspaceName}</p>
          </div>
          <Link
            href={`${base}/notifications`}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Alerts{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-border/60 px-3 py-2 md:hidden">
          {links.slice(0, 6).map((link) => {
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
