import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WorkspaceRole } from "@/types/prisma";

const roleRank: Record<WorkspaceRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

export async function requireMembership(
  workspaceSlug: string,
  minRole: WorkspaceRole = "MEMBER",
) {
  const user = await requireUser();

  const membership = await prisma.workspaceMembership.findFirst({
    where: {
      userId: user.id,
      workspace: { slug: workspaceSlug },
    },
    include: {
      workspace: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!membership) {
    notFound();
  }

  if (roleRank[membership.role] < roleRank[minRole]) {
    redirect(`/app/${workspaceSlug}/dashboard`);
  }

  return { user, membership, workspace: membership.workspace };
}

export async function listUserWorkspaces(userId: string) {
  return prisma.workspaceMembership.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
}
