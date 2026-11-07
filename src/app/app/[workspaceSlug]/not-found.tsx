import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Workspace not found",
};

export default function WorkspaceNotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-start justify-center gap-4 px-6 py-24">
      <p className="font-heading text-4xl tracking-tight">Workspace not found</p>
      <p className="text-sm text-muted-foreground">
        This workspace doesn&apos;t exist, or you don&apos;t have access.
      </p>
      <Link href="/app" className={cn(buttonVariants({ className: "mt-2" }))}>
        Your workspaces
      </Link>
    </div>
  );
}
