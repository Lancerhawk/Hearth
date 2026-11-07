import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import {
  listUserWorkspaces,
  requireMembership,
} from "@/lib/budget/access";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, membership, user } = await requireMembership(workspaceSlug);
  const memberships = await listUserWorkspaces(user.id);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-heading text-4xl tracking-tight">{workspace.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {membership.role.toLowerCase()} · {workspace.currency}
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <WorkspaceSwitcher memberships={memberships} activeSlug={workspace.slug} />

      <div className="rounded-xl border border-border/80 bg-card/70 p-6">
        <h1 className="font-heading text-2xl">Dashboard</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Month activity, bills, and statements land here next. Your workspace
          and default categories are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/app/${workspace.slug}/dashboard`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Refresh
          </Link>
          <Link
            href="/app/workspaces/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Another workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
