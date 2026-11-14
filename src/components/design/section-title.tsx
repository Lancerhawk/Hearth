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
        "font-heading text-xl tracking-tight text-hearth-ink",
        className,
      )}
    >
      {children}
    </h2>
  );
}
