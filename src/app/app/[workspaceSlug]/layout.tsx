import { after } from "next/server";
import { syncBillNotifications } from "@/actions/notifications";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, user } = await requireMembership(workspaceSlug);

  // Don't block navigation on bill-alert sync (was N+1 queries every click).
  after(() => {
    void syncBillNotifications(workspace.id, workspace.slug);
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      readAt: null,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
  });

  return (
    <WorkspaceShell
      workspaceSlug={workspace.slug}
      workspaceName={workspace.name}
      unreadCount={unreadCount}
    >
      {children}
    </WorkspaceShell>
  );
}
