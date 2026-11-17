import Link from "next/link";
import { Atmosphere } from "@/components/design/atmosphere";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <Atmosphere className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      <header className="relative z-20 flex items-center justify-end gap-2 px-6 py-5 md:px-10">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-hearth-ink/80",
          )}
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-hearth-ink/15 bg-white/50",
          )}
        >
          Get started
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-6 md:px-10">
        <div className="hearth-enter mx-auto flex w-full max-w-5xl flex-1 flex-col justify-end pb-16 pt-10 md:justify-center md:pb-28 md:pt-0">
          <p className="font-heading text-[clamp(4.25rem,14vw,8.5rem)] leading-[0.88] tracking-[-0.035em] text-hearth-ink">
            Hearth
          </p>
          <h1 className="mt-7 max-w-xl text-xl leading-snug text-hearth-ink md:mt-9 md:text-[1.65rem]">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-hearth-ink/65 md:text-[1.05rem]">
            Shared workspaces for salary, bills, daily spend, and savings — with
            a calendar that shows what the house bought, and who logged it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 md:mt-12">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-hearth-moss px-6 shadow-none hover:bg-[color-mix(in_srgb,var(--hearth-moss)_86%,black)]",
              )}
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-hearth-ink/15 bg-white/55 px-6 backdrop-blur-sm",
              )}
            >
              I already have an account
            </Link>
          </div>
        </div>
      </main>

      {/* Grounding plane — fills the empty lower field without adding card clutter */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] md:h-[46%]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--hearth-moss)_18%,transparent)_38%,color-mix(in_srgb,var(--hearth-moss)_32%,var(--hearth-paper))_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-hearth-ink/10" />
        <div className="absolute bottom-8 left-6 right-6 mx-auto flex max-w-5xl justify-between text-[11px] uppercase tracking-[0.14em] text-hearth-ink/40 md:bottom-10 md:left-10 md:right-10">
          <span>Shared ledger</span>
          <span>Household · Attribution · Months</span>
        </div>
      </div>
    </Atmosphere>
  );
}
