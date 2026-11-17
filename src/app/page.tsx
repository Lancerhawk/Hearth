import Link from "next/link";
import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <Atmosphere className="flex flex-1 flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <BrandMark href="/" size="md" />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Sign in
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-28 pt-8 md:px-12">
        <div className="hearth-enter mx-auto w-full max-w-4xl">
          <p className="font-heading text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] tracking-[-0.03em] text-hearth-ink">
            Hearth
          </p>
          <h1 className="mt-8 max-w-xl font-sans text-xl font-normal leading-snug text-hearth-ink/75 md:text-2xl">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            Shared workspaces for salary, bills, daily spend, and savings — with
            a calendar that shows what the house bought, and who logged it.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              I already have an account
            </Link>
          </div>
        </div>
      </main>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--hearth-moss)_28%,transparent),transparent_72%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--hearth-ember)_18%,transparent),transparent_70%)] blur-2xl"
      />
    </Atmosphere>
  );
}
