import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { Surface } from "@/components/design/surface";
import { Button, buttonVariants } from "@/components/ui/button";
import { listUserWorkspaces, requireUser } from "@/lib/budget/access";
import { cn } from "@/lib/utils";

export default async function AppHomePage() {
  const user = await requireUser();
  const memberships = await listUserWorkspaces(user.id);

  return (
    <Atmosphere className="flex flex-1 flex-col">
      <div className="hearth-enter mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-14 md:py-20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <BrandMark href="/" size="lg" />
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
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
          <Surface tone="quiet" padding="lg" className="text-center">
            <p className="font-heading text-2xl tracking-tight">
              No workspaces yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Create your first space to start tracking this month together.
            </p>
            <Link
              href="/app/workspaces/new"
              className={cn(buttonVariants({ size: "lg", className: "mt-8" }))}
            >
              Create workspace
            </Link>
          </Surface>
        ) : (
          <ul className="space-y-3">
            {memberships.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/app/${m.workspace.slug}/dashboard`}
                  className="group flex items-center justify-between rounded-2xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_32%,white)] px-5 py-4 transition-colors hearth-elevate hover:border-hearth-moss/35 hover:bg-[color-mix(in_srgb,var(--hearth-moss)_8%,white)]"
                >
                  <div>
                    <p className="font-heading text-lg tracking-tight text-hearth-ink">
                      {m.workspace.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {m.role.toLowerCase()} · {m.workspace.currency}
                      {m.workspace.kind === "PERSONAL"
                        ? " · just you"
                        : " · home"}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground transition-colors group-hover:text-hearth-moss">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/app/workspaces/new"
          className={cn(
            buttonVariants({
              variant: memberships.length > 0 ? "outline" : "default",
              size: "lg",
              className: "self-start",
            }),
          )}
        >
          {memberships.length > 0
            ? "Create another workspace"
            : "Create workspace"}
        </Link>
      </div>
    </Atmosphere>
  );
}
