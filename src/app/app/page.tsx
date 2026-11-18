import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { Surface } from "@/components/design/surface";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { listUserWorkspaces, requireUser } from "@/lib/budget/access";
import { cn } from "@/lib/utils";

export default async function AppHomePage() {
  const user = await requireUser();
  const memberships = await listUserWorkspaces(user.id);
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tr = (path: string) => t(dict, path);

  return (
    <Atmosphere className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-14 md:py-20">
        <div className="hearth-enter flex items-start justify-between gap-4">
          <div>
            <BrandMark href="/" size="lg" />
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              {user.name ?? user.email} — {tr("workspaces.title")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleToggle locale={locale} />
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                {tr("nav.signOut")}
              </Button>
            </form>
          </div>
        </div>

        {memberships.length === 0 ? (
          <Surface
            tone="quiet"
            padding="lg"
            className="hearth-enter hearth-enter-delay-1 text-center"
          >
            <p className="font-heading text-2xl tracking-tight">
              {tr("workspaces.empty")}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tr("workspaces.emptyBody")}
            </p>
            <Link
              href="/app/workspaces/new"
              className={cn(buttonVariants({ size: "lg", className: "mt-8" }))}
            >
              {tr("workspaces.create")}
            </Link>
          </Surface>
        ) : (
          <ul className="hearth-enter hearth-enter-delay-1 space-y-3">
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
                        ? ` · ${tr("workspaces.kindPersonal")}`
                        : ` · ${tr("workspaces.kindHome")}`}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground transition-colors group-hover:text-hearth-moss">
                    {tr("workspaces.open")} →
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
          {tr("workspaces.create")}
        </Link>
      </div>
    </Atmosphere>
  );
}
