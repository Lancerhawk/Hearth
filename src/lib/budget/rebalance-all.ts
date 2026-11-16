import { rebalanceEntriesToDateMonth } from "@/lib/budget/rebalance-entries";
import { prisma } from "@/lib/prisma";

/**
 * One-shot repair: rebalance every workspace so entry dates own their month.
 * Keep this off the interactive page path.
 */
export async function rebalanceAllWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  for (const workspace of workspaces) {
    await rebalanceEntriesToDateMonth(workspace.id);
  }

  return { workspaceCount: workspaces.length };
}
