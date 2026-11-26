import type { Metadata } from "next";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { PageHeader } from "@/components/design/page-header";
import { QuietList, QuietListItem } from "@/components/design/quiet-list";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const dict = await getDictionary(await getLocale());
  const tr = (path: string) => t(dict, path);
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
        title={tr("categories.title")}
        description={tr("categories.description")}
      />

      {canAdmin ? <CategoryForm action={create} /> : null}

      <QuietList>
        {categories.map((c) => (
          <QuietListItem key={c.id}>
            <div className="flex items-center gap-3">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ background: c.color ?? "var(--hearth-moss)" }}
              />
              <div>
                <p className="font-medium text-hearth-ink">{c.name}</p>
                <p className="text-xs text-hearth-ink/55">
                  {c.type === "EXPENSE"
                    ? tr("categories.typeExpense")
                    : tr("categories.typeCharge")}
                </p>
              </div>
            </div>
            {canAdmin ? (
              <form
                action={async () => {
                  "use server";
                  await deleteCategoryAction(workspaceSlug, c.id);
                }}
              >
                <PendingSubmitButton
                  size="sm"
                  variant="ghost"
                  pendingLabel={tr("common.loading")}
                >
                  {tr("common.delete")}
                </PendingSubmitButton>
              </form>
            ) : null}
          </QuietListItem>
        ))}
      </QuietList>
    </div>
  );
}
