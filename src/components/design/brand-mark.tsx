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
    md: "text-[1.65rem] leading-none",
    lg: "text-4xl leading-none",
    hero: "text-6xl md:text-8xl leading-[0.92]",
  };

  return (
    <Link
      href={href}
      className={cn(
        "font-heading tracking-[-0.03em] text-hearth-ink transition-opacity hover:opacity-75",
        sizes[size],
        className,
      )}
    >
      Hearth
    </Link>
  );
}
