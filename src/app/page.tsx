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

const heroDays = [
  { d: 1 },
  { d: 2 },
  { d: 3 },
  { d: 4, spend: "₹420", hot: true },
  { d: 5 },
  { d: 6 },
  { d: 7 },
  { d: 8 },
  { d: 9 },
  { d: 10 },
  { d: 11 },
  { d: 12, spend: "₹1.2k", hot: true, active: true },
  { d: 13 },
  { d: 14 },
  { d: 15 },
  { d: 16 },
  { d: 17 },
  { d: 18, spend: "₹85", hot: true },
  { d: 19 },
  { d: 20 },
  { d: 21 },
  { d: 22 },
  { d: 23, spend: "₹640", hot: true },
  { d: 24 },
  { d: 25 },
  { d: 26 },
  { d: 27 },
  { d: 28 },
];

/** Full-bleed month ledger plane for the hero — not a floating card. */
function HeroLedger({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full min-h-[28rem] flex-col overflow-hidden border-l border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_28%,white)]",
        className,
      )}
    >
      <div className="flex items-end justify-between gap-4 border-b border-hearth-ink/10 px-6 py-5 md:px-8 md:py-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-hearth-ink/45">
            This month
          </p>
          <p className="mt-1 font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
            November
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-hearth-moss">
            Remaining
          </p>
          <p className="mt-1 font-heading text-2xl tracking-tight text-hearth-ink tabular-money md:text-3xl">
            ₹48,260
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-hearth-ink/10 bg-hearth-ink/10">
        <div className="bg-[color-mix(in_srgb,var(--hearth-ember)_12%,white)] px-4 py-3 md:px-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-hearth-ink/45">
            Funds
          </p>
          <p className="mt-1 font-heading text-lg tabular-money text-hearth-ink">
            ₹92,000
          </p>
        </div>
        <div className="bg-[color-mix(in_srgb,var(--hearth-paper)_55%,white)] px-4 py-3 md:px-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-hearth-ink/45">
            Spent
          </p>
          <p className="mt-1 font-heading text-lg tabular-money text-hearth-ink">
            ₹43,740
          </p>
        </div>
        <div className="bg-[color-mix(in_srgb,var(--hearth-moss)_10%,white)] px-4 py-3 md:px-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-hearth-ink/45">
            Bills due
          </p>
          <p className="mt-1 font-heading text-lg tabular-money text-hearth-ink">
            2
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.14em] text-hearth-ink/40">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid flex-1 grid-cols-7 gap-1.5 content-start">
          {heroDays.map((day) => (
            <div
              key={day.d}
              className={cn(
                "flex min-h-[3.1rem] flex-col justify-between rounded-md border px-1.5 py-1.5 md:min-h-[3.6rem]",
                day.active
                  ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_18%,white)]"
                  : day.hot
                    ? "border-hearth-moss/30 bg-[color-mix(in_srgb,var(--hearth-moss)_9%,white)]"
                    : "border-hearth-ink/8 bg-white/35",
              )}
            >
              <span className="text-[10px] text-hearth-ink/65">{day.d}</span>
              {day.spend ? (
                <span className="truncate text-[10px] font-medium tabular-money text-hearth-moss">
                  {day.spend}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-hearth-ink/10 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-hearth-ink/45">
            Day 12
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-hearth-ink">
                Groceries <span className="text-hearth-ink/45">· Sam</span>
              </span>
              <span className="tabular-money text-hearth-ink">₹1,240</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-hearth-ink">
                Fuel <span className="text-hearth-ink/45">· Arin</span>
              </span>
              <span className="tabular-money text-hearth-ink">₹800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeCalendar() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-hearth-ink/10 hearth-elevate-soft"
    >
      <HeroLedger className="min-h-[26rem] border-l-0" />
    </div>
  );
}

export default function Home() {
  return (
    <Atmosphere className="relative flex min-h-dvh flex-1 flex-col">
      <header className="relative z-30 flex items-center justify-between px-6 py-5 md:px-10">
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

      {/* Hero — one composition: brand + copy + full-bleed ledger plane */}
      <section className="relative z-10 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="hearth-drift absolute -left-24 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-moss)_28%,transparent),transparent_70%)]" />
          <div className="hearth-drift absolute bottom-[-8%] left-[18%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_18%,transparent),transparent_72%)] [animation-delay:-6s]" />
          <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(105deg,transparent_0%,color-mix(in_srgb,var(--hearth-mist)_55%,transparent)_28%,color-mix(in_srgb,var(--hearth-moss)_22%,var(--hearth-paper))_100%)] lg:block" />
        </div>

        <div className="hearth-enter relative flex flex-1 flex-col justify-center px-6 pb-12 pt-4 md:px-10 lg:pb-20 lg:pr-8 lg:pt-0">
          <p className="font-heading text-[clamp(4.25rem,14vw,8.25rem)] leading-[0.86] tracking-[-0.04em] text-hearth-ink">
            Hearth
          </p>
          <h1 className="mt-7 max-w-md font-heading text-[1.65rem] leading-[1.15] tracking-tight text-hearth-ink md:mt-8 md:text-[2rem]">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-hearth-ink/65 md:text-[1.05rem]">
            Salary, bills, daily spend, and savings in one quiet ledger — with a
            calendar that shows what the house bought, and who logged it.
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

        {/* Desktop: edge-to-edge ledger plane */}
        <div className="hearth-rise hearth-rise-delay relative hidden min-h-full lg:block">
          <HeroLedger className="absolute inset-0 min-h-full border-l border-hearth-ink/10" />
        </div>

        {/* Mobile: full-bleed ledger plane under copy */}
        <div className="hearth-rise relative border-t border-hearth-ink/10 lg:hidden">
          <HeroLedger className="min-h-[28rem] border-l-0" />
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
