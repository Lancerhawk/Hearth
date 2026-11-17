import Link from "next/link";
import { Atmosphere } from "@/components/design/atmosphere";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const monthFlow = [
  {
    title: "Money in",
    body: "Log salary and other earnings for the month. Everyone sees the same shared pot.",
  },
  {
    title: "Bills & obligations",
    body: "Track rent, EMI, utilities — pending, paid, or skipped — with due dates that alert the house.",
  },
  {
    title: "Daily spend",
    body: "Add groceries, food, and transport on the calendar day they happened, or as a simple list.",
  },
  {
    title: "Savings & charges",
    body: "Park money aside and catch one-off charges without losing the month’s remaining balance.",
  },
];

const pillars = [
  {
    title: "Attribution built in",
    body: "Every entry shows who logged it and when — so “who spent on groceries?” is never a fight.",
  },
  {
    title: "Month-scoped clarity",
    body: "November never mixes with October. Counters for spent, remaining, and bills due stay honest.",
  },
  {
    title: "Statements you can print",
    body: "Filter by kind, member, or category, then preview and print a clean household statement.",
  },
];

export default function Home() {
  return (
    <Atmosphere className="relative flex min-h-dvh flex-1 flex-col">
      <header className="relative z-30 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg tracking-tight text-hearth-ink/65 transition-opacity hover:opacity-80 md:text-xl"
        >
          Hearth
        </Link>
        <div className="flex items-center gap-2">
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
              "border-hearth-ink/15 bg-white/45",
            )}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* One room. No side mock. Atmosphere is the visual. */}
      <section className="relative z-10 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-15%,color-mix(in_srgb,var(--hearth-moss)_42%,transparent),transparent_58%)]" />
          <div className="hearth-drift absolute -left-[12%] top-[18%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-moss)_28%,transparent),transparent_68%)]" />
          <div className="hearth-drift absolute -right-[8%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_22%,transparent),transparent_70%)] [animation-delay:-8s]" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--hearth-moss)_18%,var(--hearth-paper))_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-hearth-ink/10" />
        </div>

        <div className="relative flex flex-1 flex-col justify-center px-6 pb-16 pt-6 md:px-10 md:pb-24">
          <div className="hearth-enter mx-auto w-full max-w-4xl text-center sm:text-left">
            <p className="font-heading text-[clamp(5.5rem,18vw,12rem)] leading-[0.8] tracking-[-0.05em] text-hearth-ink">
              Hearth
            </p>
            <h1 className="mx-auto mt-8 max-w-2xl font-heading text-[clamp(1.55rem,3.4vw,2.35rem)] leading-[1.12] tracking-tight text-hearth-ink sm:mx-0 md:mt-10">
              Household money, kept together.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-hearth-ink/65 sm:mx-0 md:text-[1.1rem]">
              Salary, bills, daily spend, and savings in one quiet ledger — with
              clear attribution for everyone at home.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-hearth-moss px-7 shadow-none hover:bg-[color-mix(in_srgb,var(--hearth-moss)_86%,black)]",
                )}
              >
                Create your workspace
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-hearth-ink/15 bg-white/50 px-7 backdrop-blur-sm",
                )}
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>

        <div className="hearth-soft-in relative z-10 border-t border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)]/80">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between md:px-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-moss">
              Built for the house
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-hearth-ink/55 sm:text-right">
              Shared funds · day-by-day spend · bills that alert · statements
              you can print
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_70%,white)] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-moss">
              How a month works
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
              One ledger. One household. One clear month.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-hearth-ink/60">
              Hearth keeps every month self-contained — so remaining balance,
              bills due, and day-by-day spend always match the period you’re
              looking at.
            </p>
          </div>
          <ol className="space-y-0 divide-y divide-hearth-ink/10 border-y border-hearth-ink/10">
            {monthFlow.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-6"
              >
                <span className="font-heading text-2xl text-hearth-moss/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-xl tracking-tight text-hearth-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-hearth-ink/60">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-moss">
            Shared days
          </p>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
            See the house’s days, not just totals.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-hearth-ink/60">
            Open any day to see what was bought, how much, and who added it —
            then jump straight to logging the next expense. Calendar and list
            stay in sync with the same month counters.
          </p>
          <div className="mt-12 grid gap-8 border-t border-hearth-ink/10 pt-10 md:grid-cols-3">
            {[
              {
                label: "Day cells",
                body: "Spend shows up on the day it happened — not buried in a feed.",
              },
              {
                label: "Who logged it",
                body: "Every row carries a name, so the house stays honest without a fight.",
              },
              {
                label: "Month stays whole",
                body: "Funds, spent, and remaining always belong to the month you’re viewing.",
              },
            ].map((item) => (
              <div key={item.label}>
                <h3 className="font-heading text-xl tracking-tight text-hearth-ink">
                  {item.label}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-hearth-ink/60">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-mist)_35%,white)] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-moss">
            Built for shared homes
          </p>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
            Designed for households that actually share a budget.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {pillars.map((item) => (
              <div key={item.title}>
                <h3 className="font-heading text-xl tracking-tight text-hearth-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-hearth-ink/60">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden bg-[color-mix(in_srgb,var(--hearth-moss)_92%,black)] px-6 py-20 text-[color-mix(in_srgb,var(--hearth-paper)_96%,white)] md:px-10 md:py-24">
        <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl tracking-tight md:text-4xl">
              Start your household ledger tonight.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[color-mix(in_srgb,var(--hearth-paper)_72%,transparent)]">
              Create a workspace, invite the people you live with, and keep this
              month’s money in one quiet place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[color-mix(in_srgb,var(--hearth-paper)_96%,white)] px-6 text-hearth-ink shadow-none hover:bg-white",
              )}
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-[color-mix(in_srgb,var(--hearth-paper)_35%,transparent)] bg-transparent px-6 text-[color-mix(in_srgb,var(--hearth-paper)_96%,white)] hover:bg-white/10 hover:text-white",
              )}
            >
              Sign in
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_40%,transparent),transparent_70%)]"
        />
      </section>

      <footer className="relative z-10 border-t border-hearth-ink/10 px-6 py-8 md:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 text-sm text-hearth-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-lg tracking-tight text-hearth-ink/70">
            Hearth
          </p>
          <p>Household money, kept together.</p>
        </div>
      </footer>
    </Atmosphere>
  );
}
