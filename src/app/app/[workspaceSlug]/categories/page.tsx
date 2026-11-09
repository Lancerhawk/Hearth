import type { Metadata } from "next";
import { createCategoryAction, deleteCategoryAction } from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
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
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Organize expenses and charges.</p>
      </div>

      {canAdmin ? <CategoryForm action={create} /> : null}

      <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
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
