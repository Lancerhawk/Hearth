"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { SettingsActionState } from "@/actions/settings";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/design/brand-mark";
import { NavLink } from "@/components/layout/nav-link";
import {
  NotificationsPanel,
  type NotificationItem,
} from "@/components/layout/notifications-panel";
import { SettingsPanel } from "@/components/layout/settings-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PiggyBank,
  Receipt,
  ScrollText,
  Settings,
  Tags,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const headerBtn =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-transparent px-2.5 text-sm text-hearth-ink transition-colors duration-150 hover:border-hearth-moss/45 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] hover:text-hearth-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hearth-moss/40";

const SIDEBAR_KEY = "hearth-sidebar-collapsed";
const SIDEBAR_EVENT = "hearth-sidebar";

function subscribeSidebar(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_EVENT, onStoreChange);
  };
}

function getSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

function setSidebarCollapsed(next: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SIDEBAR_EVENT));
}

const navIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  month: CalendarDays,
  income: Wallet,
  expenses: Receipt,
  savings: PiggyBank,
  charges: CreditCard,
  bills: FileText,
  members: Users,
  categories: Tags,
  "statements/preview": ScrollText,
};

type Panel = "notifications" | "settings" | null;

export function WorkspaceShell({
  workspaceSlug,
  workspaceName,
  unreadCount,
  moneyInLabel = "Funds",
  notifications,
  isOwner,
  currency,
  profileName,
  workspaceAction,
  profileAction,
  children,
}: {
  workspaceSlug: string;
  workspaceName: string;
  unreadCount: number;
  moneyInLabel?: string;
  notifications: NotificationItem[];
  isOwner: boolean;
  currency: string;
  profileName: string;
  workspaceAction: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
  profileAction: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
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
  const [panel, setPanel] = useState<Panel>(null);
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarCollapsed,
    () => false,
  );

  function toggleCollapsed() {
    setSidebarCollapsed(!collapsed);
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar/90 transition-[width,padding] duration-300 ease-in-out md:flex",
          collapsed ? "w-[4.5rem] p-3" : "w-60 p-5",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center",
            collapsed ? "justify-center" : "justify-between gap-2",
          )}
        >
          {collapsed ? (
            <Link
              href={`${base}/dashboard`}
              title="Hearth"
              aria-label="Hearth"
              className="font-heading text-xl tracking-tight text-hearth-ink transition-opacity hover:opacity-80"
            >
              H
            </Link>
          ) : (
            <BrandMark href={`${base}/dashboard`} size="md" />
          )}
        </div>

        <nav
          className={cn(
            "mt-7 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain",
            collapsed ? "items-center pr-0" : "pr-1",
          )}
        >
          {links.map((link) => {
            const href = `${base}/${link.href}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = navIcons[link.href] ?? LayoutDashboard;
            return (
              <NavLink
                key={link.href}
                href={href}
                prefetch
                title={link.label}
                aria-label={link.label}
                className={cn(
                  "flex items-center rounded-md text-sm transition-colors duration-150",
                  collapsed ? "size-9 justify-center" : "gap-2.5 px-2.5 py-2",
                  active
                    ? "hearth-nav-active font-medium"
                    : "text-foreground/75 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))] hover:text-hearth-ink",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span
                  className={cn(
                    "truncate transition-opacity duration-200",
                    collapsed ? "sr-only" : "opacity-100",
                  )}
                >
                  {link.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            headerBtn,
            "mt-3 size-8 shrink-0 self-center px-0",
            !collapsed && "self-end",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
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
            <button
              type="button"
              title="Notifications"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              onClick={() => setPanel("notifications")}
              className={cn(
                headerBtn,
                "relative size-8 px-0",
                panel === "notifications" &&
                  "border-hearth-moss/50 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))]",
              )}
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-hearth-moss px-1 py-0.5 text-[10px] leading-none text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => setPanel("settings")}
              className={cn(
                headerBtn,
                "size-8 px-0",
                panel === "settings" &&
                  "border-hearth-moss/50 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))]",
              )}
            >
              <Settings className="size-4" />
            </button>
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
              <NavLink
                key={link.href}
                href={href}
                prefetch
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors duration-150",
                  active
                    ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
                    : "border-border text-muted-foreground hover:border-hearth-moss/40 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))] hover:text-hearth-ink",
                )}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        <main className="hearth-enter flex-1 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>

      <Sheet
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 duration-300 ease-out sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-border/70 px-5 py-4 pr-12">
            <SheetTitle>
              {panel === "settings" ? "Settings" : "Alerts"}
            </SheetTitle>
            <SheetDescription>
              {panel === "settings"
                ? "Workspace and profile preferences."
                : "Invites, bills, and budget warnings."}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {panel === "settings" ? (
              <SettingsPanel
                isOwner={isOwner}
                workspaceName={workspaceName}
                currency={currency}
                profileName={profileName}
                workspaceAction={workspaceAction}
                profileAction={profileAction}
              />
            ) : (
              <NotificationsPanel
                workspaceSlug={workspaceSlug}
                notifications={notifications}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
