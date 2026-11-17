import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-[1.35rem] tracking-tight text-hearth-ink md:text-xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}
