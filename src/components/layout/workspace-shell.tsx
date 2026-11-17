"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { SettingsActionState } from "@/actions/settings";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/design/brand-mark";
import { NavLink } from "@/components/layout/nav-link";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { RouteWarmer } from "@/components/layout/route-warmer";
import { SettingsPanel } from "@/components/layout/settings-panel";
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
  LayoutGrid,
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

const topbarIcon =
  "inline-flex size-9 items-center justify-center rounded-lg text-hearth-ink/70 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_12%,transparent)] hover:text-hearth-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hearth-moss/35";

const topbarIconActive =
  "bg-[color-mix(in_srgb,var(--hearth-moss)_14%,transparent)] text-hearth-ink";

const sidebarToggle =
  "inline-flex size-8 items-center justify-center rounded-lg border border-sidebar-border/80 bg-transparent text-hearth-ink/70 transition-colors hover:border-hearth-moss/35 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_12%,var(--hearth-paper))] hover:text-hearth-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hearth-moss/35";

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
      <RouteWarmer workspaceSlug={workspaceSlug} />
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-[color-mix(in_srgb,var(--hearth-mist)_70%,white)]/95 transition-[width,padding] duration-300 ease-in-out md:flex",
          collapsed ? "w-[4.5rem] p-3" : "w-64 p-5",
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
              href="/"
              title="Hearth home"
              aria-label="Hearth home"
              className="font-heading text-xl tracking-tight text-hearth-ink transition-opacity hover:opacity-80"
            >
              H
            </Link>
          ) : (
            <BrandMark href="/" size="md" />
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
            sidebarToggle,
            "mt-3 shrink-0 self-center",
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
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-hearth-ink/8 bg-[color-mix(in_srgb,var(--hearth-paper)_82%,white)]/90 px-4 backdrop-blur-md md:h-16 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
              <BrandMark href="/" size="sm" />
              <span className="sr-only">Workspace {workspaceName}</span>
            </div>
            <div className="hidden min-w-0 items-center gap-3 md:flex">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--hearth-moss)_14%,white)] font-heading text-sm tracking-tight text-hearth-moss"
              >
                {workspaceName.trim().charAt(0).toUpperCase() || "H"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-hearth-ink/45">
                  Workspace
                </p>
                <p className="truncate text-[0.95rem] font-medium leading-tight text-hearth-ink">
                  {workspaceName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-hearth-ink/8 bg-[color-mix(in_srgb,var(--hearth-paper)_35%,white)]/80 p-1">
            <Link
              href="/app"
              prefetch
              title="Workspaces"
              aria-label="Workspaces"
              className={cn(topbarIcon, "gap-1.5 px-2.5 sm:w-auto sm:px-3")}
            >
              <LayoutGrid className="size-4 shrink-0" />
              <span className="hidden text-xs font-medium sm:inline">
                Spaces
              </span>
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
                topbarIcon,
                "relative",
                panel === "notifications" && topbarIconActive,
              )}
            >
              <Bell className="size-4" />
              {unreadCount > 0 ? (
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-hearth-moss" />
              ) : null}
            </button>
            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => setPanel("settings")}
              className={cn(
                topbarIcon,
                panel === "settings" && topbarIconActive,
              )}
            >
              <Settings className="size-4" />
            </button>
            <span aria-hidden className="mx-0.5 h-5 w-px bg-hearth-ink/10" />
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className={topbarIcon}
              >
                <LogOut className="size-4" />
              </button>
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

        <main className="hearth-enter flex-1 px-4 py-8 md:px-10 md:py-10">
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
                open={panel === "notifications"}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
