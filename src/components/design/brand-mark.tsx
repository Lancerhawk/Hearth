import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  href = "/",
  className,
  size = "md",
}: {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
    hero: "text-6xl md:text-8xl leading-[0.95]",
  };

  return (
    <Link
      href={href}
      className={cn(
        "font-heading tracking-tight text-hearth-ink transition-opacity hover:opacity-80",
        sizes[size],
        className,
      )}
    >
      Hearth
    </Link>
  );
}
