"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { SettingsActionState } from "@/actions/settings";
import { logoutAction } from "@/actions/auth";
import { BrandMark } from "@/components/design/brand-mark";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { useLocale, useT } from "@/components/i18n/locale-provider";
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
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-hearth-ink/70 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_12%,transparent)] hover:text-hearth-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hearth-moss/35";

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
  const t = useT();
  const { locale } = useLocale();
  const fundsLabel =
    moneyInLabel === "Income" ? t("nav.income") : t("nav.funds");
  const links = [
    { href: "dashboard", label: t("nav.dashboard") },
    { href: "month", label: t("nav.month") },
    { href: "income", label: fundsLabel },
    { href: "expenses", label: t("nav.expenses") },
    { href: "savings", label: t("nav.savings") },
    { href: "charges", label: t("nav.charges") },
    { href: "bills", label: t("nav.bills") },
    { href: "members", label: t("nav.members") },
    { href: "categories", label: t("nav.categories") },
    { href: "statements/preview", label: t("nav.statements") },
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
        <header className="sticky top-0 z-20 border-b border-hearth-ink/8 bg-[color-mix(in_srgb,var(--hearth-paper)_82%,white)]/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:h-16 md:px-8">
            <div className="flex h-9 min-w-0 items-center">
              <div className="flex h-9 items-center md:hidden">
                <BrandMark href="/" size="sm" />
                <span className="sr-only">Workspace {workspaceName}</span>
              </div>
              <div className="hidden h-9 min-w-0 items-center gap-3 md:flex">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--hearth-moss)_14%,white)] font-heading text-sm leading-none text-hearth-moss"
                >
                  {workspaceName.trim().charAt(0).toUpperCase() || "H"}
                </span>
                <div className="flex h-9 min-w-0 flex-col justify-center gap-1">
                  <p className="truncate text-[10px] font-medium leading-none uppercase tracking-[0.14em] text-hearth-ink/45">
                    Workspace
                  </p>
                  <p className="truncate text-sm font-medium leading-none text-hearth-ink">
                    {workspaceName}
                  </p>
                </div>
              </div>
            </div>

            <nav
              aria-label="Workspace actions"
              className="flex h-9 shrink-0 items-center gap-1"
            >
              <LocaleToggle
                locale={locale}
                className="mr-1 hidden sm:inline-flex"
              />
              <Link
                href="/app"
                prefetch
                title={t("nav.workspaces")}
                aria-label={t("nav.workspaces")}
                className={cn(topbarIcon, "w-auto min-w-8 gap-1.5 px-2.5")}
              >
                <LayoutGrid className="size-3.5 shrink-0" aria-hidden />
                <span className="hidden text-xs font-medium leading-none sm:inline">
                  {t("nav.workspaces")}
                </span>
              </Link>
              <button
                type="button"
                title={t("nav.alerts")}
                aria-label={t("nav.alerts")}
                onClick={() => setPanel("notifications")}
                className={cn(
                  topbarIcon,
                  "relative",
                  panel === "notifications" && topbarIconActive,
                )}
              >
                <Bell className="size-3.5" aria-hidden />
                {unreadCount > 0 ? (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-hearth-moss" />
                ) : null}
              </button>
              <button
                type="button"
                title={t("nav.settings")}
                aria-label={t("nav.settings")}
                onClick={() => setPanel("settings")}
                className={cn(
                  topbarIcon,
                  panel === "settings" && topbarIconActive,
                )}
              >
                <Settings className="size-3.5" aria-hidden />
              </button>
              <span
                aria-hidden
                className="mx-1 h-4 w-px shrink-0 bg-hearth-ink/12"
              />
              <form action={logoutAction} className="contents">
                <button
                  type="submit"
                  title={t("nav.signOut")}
                  aria-label={t("nav.signOut")}
                  className={topbarIcon}
                >
                  <LogOut className="size-3.5" aria-hidden />
                </button>
              </form>
            </nav>
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

        <main className="hearth-enter hearth-enter-delay-1 flex-1 px-4 py-8 md:px-10 md:py-10">
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
          className="w-full gap-0 border-l border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_72%,white)] p-0 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-border/60 bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)] px-5 py-4 pr-12">
            <SheetTitle className="font-heading text-xl tracking-tight text-hearth-ink">
              {panel === "settings"
                ? t("settings.title")
                : t("notifications.title")}
            </SheetTitle>
            <SheetDescription className="text-hearth-ink/55">
              {panel === "settings"
                ? t("settings.description")
                : t("notifications.description")}
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
