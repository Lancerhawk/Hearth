import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { listUserWorkspaces, requireUser } from "@/lib/budget/access";
import { cn } from "@/lib/utils";

export default async function AppHomePage() {
  const user = await requireUser();
  const memberships = await listUserWorkspaces(user.id);

  if (memberships.length === 1) {
    redirect(`/app/${memberships[0].workspace.slug}/dashboard`);
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-4xl tracking-tight">Hearth</p>
          <p className="mt-2 text-muted-foreground">
            Hi {user.name ?? user.email} — pick a workspace or create one.
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="font-heading text-xl">No workspaces yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first household space to start tracking this month.
          </p>
          <Link
            href="/app/workspaces/new"
            className={cn(buttonVariants({ className: "mt-6" }))}
          >
            Create workspace
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {memberships.map((m) => (
            <li key={m.id}>
              <Link
                href={`/app/${m.workspace.slug}/dashboard`}
                className="flex items-center justify-between rounded-xl border border-border/80 bg-card/70 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <div>
                  <p className="font-medium">{m.workspace.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.role.toLowerCase()} · {m.workspace.currency}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {memberships.length > 0 ? (
        <Link
          href="/app/workspaces/new"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Create another workspace
        </Link>
      ) : null}
    </div>
  );
}
