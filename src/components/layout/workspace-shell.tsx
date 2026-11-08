import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "dashboard", label: "Dashboard" },
  { href: "month", label: "Month" },
  { href: "income", label: "Income" },
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

export function WorkspaceShell({
  workspaceSlug,
  workspaceName,
  unreadCount,
  children,
}: {
  workspaceSlug: string;
  workspaceName: string;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const base = `/app/${workspaceSlug}`;

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-border/80 bg-sidebar/80 p-4 md:flex md:flex-col">
        <Link href={base + "/dashboard"} className="font-heading text-2xl tracking-tight">
          Hearth
        </Link>
        <p className="mt-1 truncate text-xs text-muted-foreground">{workspaceName}</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`${base}/${link.href}`}
              className="rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
              {link.href === "notifications" && unreadCount > 0 ? (
                <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="mt-4 space-y-2">
          <Link href="/app" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>
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
            <p className="font-heading text-xl">Hearth</p>
            <p className="text-xs text-muted-foreground">{workspaceName}</p>
          </div>
          <Link href={`${base}/notifications`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Alerts{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-border/60 px-3 py-2 md:hidden">
          {links.slice(0, 6).map((link) => (
            <Link
              key={link.href}
              href={`${base}/${link.href}`}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
