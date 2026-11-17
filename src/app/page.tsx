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

const ledgerRows = [
  {
    date: "12 Nov",
    title: "Groceries",
    who: "Sam",
    amount: "₹1,240",
    kind: "out" as const,
  },
  {
    date: "12 Nov",
    title: "Fuel",
    who: "Arin",
    amount: "₹800",
    kind: "out" as const,
  },
  {
    date: "10 Nov",
    title: "November salary",
    who: "Arin",
    amount: "+₹72,000",
    kind: "in" as const,
  },
  {
    date: "08 Nov",
    title: "Wifi bill",
    who: "Sam",
    amount: "₹1,199",
    kind: "out" as const,
  },
  {
    date: "06 Nov",
    title: "Emergency fund",
    who: "Arin",
    amount: "₹5,000",
    kind: "save" as const,
  },
  {
    date: "04 Nov",
    title: "Pharmacy",
    who: "Sam",
    amount: "₹420",
    kind: "out" as const,
  },
  {
    date: "02 Nov",
    title: "Brought forward",
    who: "Hearth",
    amount: "+₹12,400",
    kind: "in" as const,
  },
  {
    date: "01 Nov",
    title: "Rent",
    who: "Arin",
    amount: "₹28,000",
    kind: "out" as const,
  },
];

/** Full-bleed open ledger — dense rows, no empty calendar cells. */
function HeroLedgerPlane() {
  return (
    <div
      aria-hidden
      className="relative flex h-full min-h-[32rem] flex-col overflow-hidden border-l border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_22%,white)]"
    >
      <div className="flex items-end justify-between gap-6 border-b border-hearth-ink/10 px-7 py-6 md:px-9 md:py-7">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-hearth-ink/45">
            November · home
          </p>
          <p className="mt-2 font-heading text-[clamp(2.75rem,5vw,4rem)] leading-none tracking-[-0.03em] text-hearth-ink">
            ₹48,260
          </p>
          <p className="mt-2 text-sm text-hearth-ink/55">
            remaining · ₹92,000 funds · ₹43,740 spent
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-hearth-moss">
            Still open
          </p>
          <p className="mt-1 font-heading text-2xl text-hearth-ink">76%</p>
          <p className="text-xs text-hearth-ink/45">of funds used</p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <ul className="divide-y divide-hearth-ink/8">
          {ledgerRows.map((row) => (
            <li
              key={`${row.date}-${row.title}`}
              className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 px-7 py-3.5 md:grid-cols-[5.5rem_1fr_auto] md:gap-5 md:px-9 md:py-4"
            >
              <span className="text-xs tabular-money text-hearth-ink/40">
                {row.date}
              </span>
              <span className="min-w-0">
                <span className="font-medium text-hearth-ink">{row.title}</span>
                <span className="text-hearth-ink/40"> · {row.who}</span>
              </span>
              <span
                className={cn(
                  "font-heading text-lg tabular-money tracking-tight",
                  row.kind === "in" && "text-hearth-ember",
                  row.kind === "save" && "text-hearth-moss",
                  row.kind === "out" && "text-hearth-ink",
                )}
              >
                {row.amount}
              </span>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--hearth-paper)_70%,white))]" />
      </div>
    </div>
  );
}

function MonthStory() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-hearth-ink/10 bg-[color-mix(in_srgb,var(--hearth-paper)_35%,white)] hearth-elevate-soft"
    >
      <div className="border-b border-hearth-ink/10 px-5 py-5 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-hearth-ink/45">
          Day 12 · November
        </p>
        <p className="mt-1 font-heading text-2xl tracking-tight text-hearth-ink">
          What the house bought
        </p>
      </div>
      <ul className="divide-y divide-hearth-ink/8">
        {ledgerRows.slice(0, 5).map((row) => (
          <li
            key={`story-${row.title}-${row.date}`}
            className="flex items-baseline justify-between gap-4 px-5 py-3.5 md:px-6"
          >
            <span>
              <span className="font-medium text-hearth-ink">{row.title}</span>
              <span className="text-hearth-ink/40"> · {row.who}</span>
            </span>
            <span
              className={cn(
                "font-heading text-base tabular-money",
                row.kind === "in" ? "text-hearth-ember" : "text-hearth-ink",
              )}
            >
              {row.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <Atmosphere className="relative flex min-h-dvh flex-1 flex-col">
      <header className="relative z-30 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg tracking-tight text-hearth-ink/70 transition-opacity hover:opacity-80 md:text-xl"
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

      <section className="relative z-10 flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_8%_-5%,color-mix(in_srgb,var(--hearth-moss)_36%,transparent),transparent_55%)]" />
          <div className="hearth-drift absolute -right-24 top-0 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-moss)_22%,transparent),transparent_68%)]" />
          <div className="hearth-drift absolute bottom-[12%] left-[22%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_18%,transparent),transparent_70%)] [animation-delay:-6s]" />
          <div className="absolute inset-y-0 right-0 hidden w-[54%] bg-[linear-gradient(100deg,transparent_0%,color-mix(in_srgb,var(--hearth-mist)_40%,transparent)_24%,color-mix(in_srgb,var(--hearth-moss)_18%,var(--hearth-paper))_100%)] lg:block" />
        </div>

        <div className="hearth-enter relative flex flex-1 flex-col justify-center px-6 pb-12 pt-4 md:px-10 lg:pb-20 lg:pr-6 lg:pt-0">
          <p className="font-heading text-[clamp(4.5rem,15vw,9.5rem)] leading-[0.84] tracking-[-0.045em] text-hearth-ink">
            Hearth
          </p>
          <h1 className="mt-7 max-w-md font-heading text-[clamp(1.45rem,2.8vw,2rem)] leading-[1.15] tracking-tight text-hearth-ink md:mt-8">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-hearth-ink/65 md:text-[1.05rem]">
            Salary, bills, daily spend, and savings in one quiet ledger — with
            clear attribution for everyone at home.
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

        <div className="hearth-rise hearth-rise-delay relative hidden min-h-full lg:block">
          <HeroLedgerPlane />
        </div>

        <div className="hearth-rise relative border-t border-hearth-ink/10 lg:hidden">
          <HeroLedgerPlane />
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
              Shared days
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight text-hearth-ink md:text-4xl">
              See the house’s days, not just totals.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-hearth-ink/60">
              Open any day to see what was bought, how much, and who added it —
              then jump straight to logging the next expense.
            </p>
          </div>
          <MonthStory />
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
