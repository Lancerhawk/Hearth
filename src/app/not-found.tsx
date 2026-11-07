import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-start justify-center gap-4 px-6 py-24">
      <p className="font-heading text-5xl tracking-tight">404</p>
      <h1 className="text-xl text-muted-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That link doesn&apos;t lead anywhere in Hearth.
      </p>
      <Link href="/" className={cn(buttonVariants({ className: "mt-2" }))}>
        Back home
      </Link>
    </div>
  );
}
