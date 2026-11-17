import { cn } from "@/lib/utils";

/** Full-viewport linen grain + optional children above the grain layer. */
export function Atmosphere({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hearth-grain relative isolate min-h-full", className)}>
      <div className="relative z-[1] flex min-h-full flex-col">{children}</div>
    </div>
  );
}
