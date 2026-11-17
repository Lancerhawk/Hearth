import type { Metadata } from "next";
import Link from "next/link";
import { Atmosphere } from "@/components/design/atmosphere";
import { BrandMark } from "@/components/design/brand-mark";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { requireUser } from "@/lib/budget/access";

export const metadata: Metadata = {
  title: "New workspace",
};

export default async function NewWorkspacePage() {
  await requireUser();

  return (
    <Atmosphere className="flex flex-1 flex-col">
      <div className="hearth-enter mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <BrandMark href="/" size="md" />
          <Link
            href="/app"
            className="text-sm text-hearth-ink/55 transition-colors hover:text-hearth-ink"
          >
            ← Back to workspaces
          </Link>
        </div>
        <CreateWorkspaceForm />
      </div>
    </Atmosphere>
  );
}
