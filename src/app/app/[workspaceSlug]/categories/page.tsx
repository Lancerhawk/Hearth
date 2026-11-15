import type { Metadata } from "next";
import { createCategoryAction, deleteCategoryAction } from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { PageHeader } from "@/components/design/page-header";
import { Button } from "@/components/ui/button";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, membership } = await requireMembership(workspaceSlug);
  const canAdmin = membership.role === "OWNER" || membership.role === "ADMIN";
  const categories = await prisma.category.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  const create = createCategoryAction.bind(null, workspaceSlug);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Categories"
        description="Organize expenses and charges."
      />

      {canAdmin ? <CategoryForm action={create} /> : null}

      <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card/70">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: c.color ?? "#8a9a7b" }}
              />
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.type.toLowerCase()}</p>
              </div>
            </div>
            {canAdmin ? (
              <form
                action={async () => {
                  "use server";
                  await deleteCategoryAction(workspaceSlug, c.id);
                }}
              >
                <Button type="submit" size="sm" variant="ghost">
                  Delete
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
