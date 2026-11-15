import Link from "next/link";
import { BrandMark } from "@/components/design/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <BrandMark href="/" size="md" />
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Sign in
          </Link>
          <Link href="/register" className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>
      </header>

      <main className="hearth-enter relative z-10 flex flex-1 flex-col justify-center px-6 pb-24 pt-10 md:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-heading text-6xl leading-[0.95] tracking-tight text-hearth-ink md:text-8xl">
            Hearth
          </p>
          <h1 className="mt-6 max-w-xl text-xl text-muted-foreground md:text-2xl">
            Household money, kept together.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Shared workspaces for salary, bills, daily spend, and savings — with
            a calendar that shows what the house bought, and who logged it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_at_bottom,color-mix(in_srgb,var(--hearth-moss)_22%,transparent),transparent_70%)]"
      />
    </div>
  );
}
