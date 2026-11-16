"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMembership, requireUser } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

export type SettingsActionState = {
  error?: string;
  success?: string;
};

const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  currency: z.string().trim().min(3).max(3),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function updateWorkspaceSettingsAction(
  workspaceSlug: string,
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { workspace } = await requireMembership(workspaceSlug, "OWNER");
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) return { error: "Invalid workspace settings." };

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      name: parsed.data.name,
      currency: parsed.data.currency.toUpperCase(),
    },
  });

  // Shell shows workspace name/currency — layout revalidate is required here.
  revalidatePath(`/app/${workspaceSlug}`, "layout");
  return { success: "Workspace updated." };
}

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Name is required." };

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/app", "layout");
  return { success: "Profile updated." };
}
