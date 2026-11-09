"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(["EXPENSE", "CHARGE", "SAVINGS", "INCOME"]),
  color: z.string().trim().max(20).optional(),
});

export type CategoryActionState = {
  error?: string;
  success?: string;
};

export async function createCategoryAction(
  workspaceSlug: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { workspace } = await requireMembership(workspaceSlug, "ADMIN");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: "Invalid category." };

  try {
    await prisma.category.create({
      data: {
        workspaceId: workspace.id,
        name: parsed.data.name,
        type: parsed.data.type,
        color: parsed.data.color,
      },
    });
  } catch {
    return { error: "A category with that name already exists." };
  }

  revalidatePath(`/app/${workspaceSlug}/categories`);
  return { success: "Category created." };
}

export async function deleteCategoryAction(
  workspaceSlug: string,
  categoryId: string,
) {
  await requireMembership(workspaceSlug, "ADMIN");
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath(`/app/${workspaceSlug}/categories`);
}
