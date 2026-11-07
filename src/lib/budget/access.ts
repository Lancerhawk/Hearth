import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { WorkspaceRole } from "@/types/prisma";

const roleRank: Record<WorkspaceRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export async function requireUser() {
  // Auth/session uses crypto — must run at request time (Cache Components).
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
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
    redirect("/app");
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
