import { cache } from "react";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";
import { moneyInLabel } from "@/lib/workspace/labels";

/** One membership resolution per request for layout + pages. */
export const loadWorkspaceMembership = cache(async (workspaceSlug: string) => {
  return requireMembership(workspaceSlug);
});

export const loadWorkspaceUnreadCount = cache(
  async (userId: string, workspaceId: string) => {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
        OR: [{ workspaceId }, { workspaceId: null }],
      },
    });
  },
);

export async function loadWorkspaceShellMeta(workspaceSlug: string) {
  const { workspace, user, membership } =
    await loadWorkspaceMembership(workspaceSlug);
  const unreadCount = await loadWorkspaceUnreadCount(user.id, workspace.id);

  return {
    workspace,
    user,
    membership,
    unreadCount,
    moneyInLabel: moneyInLabel(workspace.kind),
    isOwner: membership.role === "OWNER",
  };
}
