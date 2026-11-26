import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tr = (path: string) => t(dict, path);

  return (
    <Atmosphere className="flex min-h-dvh flex-1 flex-col">
      <div className="flex flex-1 flex-col lg:hidden">
        <header className="flex items-center justify-between px-6 py-6">
          <BrandMark href="/" size="md" />
          <LocaleToggle locale={locale} />
        </header>
        <main className="hearth-enter flex flex-1 flex-col justify-center px-6 pb-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </main>
      </div>

      <div className="hidden min-h-dvh flex-1 lg:grid lg:grid-cols-2">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[color-mix(in_srgb,var(--hearth-moss)_92%,black)] px-12 py-12 text-[color-mix(in_srgb,var(--hearth-paper)_96%,white)] xl:px-16">
          <div className="relative z-[1] flex items-start justify-between gap-4">
            <BrandMark href="/" size="lg" tone="paper" />
            <LocaleToggle locale={locale} tone="paper" />
          </div>
          <div className="hearth-enter relative z-[1] max-w-md">
            <p className="font-heading text-[2.75rem] leading-[1.08] tracking-tight xl:text-5xl">
              {tr("auth.asideTitle")}
            </p>
            <p className="mt-6 text-base leading-relaxed text-[color-mix(in_srgb,var(--hearth-paper)_78%,transparent)]">
              {tr("auth.asideBody")}
            </p>
          </div>
          <p className="relative z-[1] text-[11px] uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--hearth-paper)_45%,transparent)]">
            {tr("auth.asideFooter")}
          </p>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_35%,transparent),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            }}
          />
        </aside>

        <section className="relative flex items-center justify-center bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)] px-12 py-12 xl:px-16">
          <div className="hearth-enter w-full max-w-[24rem]">{children}</div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,color-mix(in_srgb,var(--hearth-moss)_8%,transparent),transparent_45%)]"
          />
        </section>
      </div>
    </Atmosphere>
  );
}
