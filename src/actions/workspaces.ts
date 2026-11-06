"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";
import { createWorkspaceSchema } from "@/lib/validators/workspace";
import { uniqueWorkspaceSlug } from "@/lib/workspace/slug";
import { defaultCategoryCreates } from "@/lib/workspace/seed-categories";

export type WorkspaceActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createWorkspaceAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();

  const parsed = createWorkspaceSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency") || "INR",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Please fix the highlighted fields.",
    };
  }

  const slug = await uniqueWorkspaceSlug(parsed.data.name);

  const workspace = await prisma.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: {
        name: parsed.data.name,
        slug,
        currency: parsed.data.currency.toUpperCase(),
        members: {
          create: {
            userId: user.id!,
            role: "OWNER",
          },
        },
      },
    });

    await tx.category.createMany({
      data: defaultCategoryCreates(created.id),
    });

    return created;
  });

  redirect(`/app/${workspace.slug}/dashboard`);
}
