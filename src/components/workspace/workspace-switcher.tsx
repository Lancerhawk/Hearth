import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkspaceItem = {
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

export function WorkspaceSwitcher({
  memberships,
  activeSlug,
}: {
  memberships: WorkspaceItem[];
  activeSlug?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {memberships.map((m) => {
        const active = m.workspace.slug === activeSlug;
        return (
          <Link
            key={m.workspace.id}
            href={`/app/${m.workspace.slug}/dashboard`}
            className={cn(
              buttonVariants({ variant: active ? "default" : "outline", size: "sm" }),
            )}
          >
            {m.workspace.name}
          </Link>
        );
      })}
      <Link
        href="/app/workspaces/new"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        + New
      </Link>
    </div>
  );
}
