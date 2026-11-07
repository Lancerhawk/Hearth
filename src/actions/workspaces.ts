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
  values?: {
    name?: string;
    currency?: string;
  };
};

export async function createWorkspaceAction(
  _prev: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();

  const values = {
    name: String(formData.get("name") ?? ""),
    currency: String(formData.get("currency") || "INR"),
  };

  const parsed = createWorkspaceSchema.safeParse(values);

  if (!parsed.success) {
    return {
      values,
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
        currency: parsed.data.currency,
        members: {
          create: {
            userId: user.id,
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
