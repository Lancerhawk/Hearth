import type { Metadata } from "next";
import Link from "next/link";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import { requireUser } from "@/lib/budget/access";

export const metadata: Metadata = {
  title: "New workspace",
};

export default async function NewWorkspacePage() {
  await requireUser();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <Link
        href="/app"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to workspaces
      </Link>
      <CreateWorkspaceForm />
    </div>
  );
}
