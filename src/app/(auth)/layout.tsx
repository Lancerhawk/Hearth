import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Atmosphere className="flex flex-1 flex-col">
      <div className="grid min-h-full flex-1 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
          <BrandMark href="/" size="lg" />
          <div className="hearth-enter relative z-[1] max-w-md pb-8">
            <p className="font-heading text-4xl leading-[1.05] tracking-tight text-hearth-ink xl:text-5xl">
              Money for the house, in one quiet place.
            </p>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
              Sign in to your shared ledger — bills, spend, and savings with
              clear attribution.
            </p>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--hearth-moss)_26%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_80%,color-mix(in_srgb,var(--hearth-ember)_14%,transparent),transparent_50%)]"
          />
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="px-6 py-6 lg:hidden">
            <BrandMark href="/" size="md" />
          </header>
          <main className="hearth-enter flex flex-1 items-center justify-center px-6 pb-16 pt-4 lg:px-14">
            <div className="w-full max-w-md rounded-3xl border border-border/60 bg-[color-mix(in_srgb,var(--hearth-paper)_28%,white)] p-7 hearth-elevate-soft md:p-9">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Atmosphere>
  );
}
