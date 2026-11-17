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

function FakeCalendar() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div
      aria-hidden
      className="rounded-2xl border border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)] p-4 hearth-elevate-soft sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-lg tracking-tight text-hearth-ink">
          November
        </p>
        <p className="text-xs text-hearth-ink/50">Calendar · List</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-wide text-hearth-ink/40">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const hot = d === 4 || d === 12 || d === 18 || d === 23;
          return (
            <div
              key={d}
              className={cn(
                "flex aspect-square flex-col items-start justify-between rounded-lg border border-hearth-ink/8 p-1.5",
                hot
                  ? "border-hearth-moss/35 bg-[color-mix(in_srgb,var(--hearth-moss)_12%,white)]"
                  : "bg-white/40",
              )}
            >
              <span className="text-[10px] text-hearth-ink/70">{d}</span>
              {hot ? (
                <span className="w-full truncate text-[9px] text-hearth-moss">
                  {d === 4 ? "420" : d === 12 ? "1.2k" : "85"}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 border-t border-hearth-ink/8 pt-3">
        <p className="text-xs font-medium text-hearth-ink">Day 12</p>
        <p className="mt-1 text-xs text-hearth-ink/55">
          Groceries · Sam · 1,240
        </p>
        <p className="text-xs text-hearth-ink/55">Fuel · Arin · 800</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Atmosphere className="relative flex min-h-dvh flex-1 flex-col">
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-heading text-[1.65rem] leading-none tracking-[-0.03em] text-hearth-ink"
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
              "border-hearth-ink/15 bg-white/50",
            )}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero — first viewport */}
      <section className="relative z-10 flex min-h-[calc(100dvh-4.5rem)] flex-col px-6 md:px-10">
        <div className="hearth-enter mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center pb-20 pt-6">
          <p className="font-heading text-[clamp(4rem,13vw,7.75rem)] leading-[0.88] tracking-[-0.035em] text-hearth-ink">
            Hearth
          </p>
          <h1 className="mt-7 max-w-xl text-xl leading-snug text-hearth-ink md:mt-8 md:text-[1.65rem]">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-hearth-ink/65 md:text-[1.05rem]">
            A shared workspace for salary, bills, daily spend, and savings —
            with a calendar that shows what the house bought, and who logged it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--hearth-moss)_14%,transparent))]"
        />
      </section>

      {/* How a month works */}
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

      {/* Calendar visual */}
      <section className="relative z-10 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-moss">
              Month calendar
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
              See the house’s days, not just totals.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-hearth-ink/60">
              Switch between calendar and list. Open a day to see what was
              bought, how much, and who added it — then jump straight to logging
              the next expense.
            </p>
            <ul className="mt-8 space-y-3 text-[0.95rem] text-hearth-ink/70">
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hearth-moss" />
                Day cells show spend at a glance
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hearth-moss" />
                Member filters without reloading the month
              </li>
              <li className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hearth-moss" />
                Live counters for income, spent, and remaining
              </li>
            </ul>
          </div>
          <FakeCalendar />
        </div>
      </section>

      {/* Pillars */}
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

      {/* Closing CTA */}
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
