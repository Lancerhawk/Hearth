import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireMembership } from "@/lib/budget/access";
import { syncBillNotifications } from "@/actions/notifications";
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

  await syncBillNotifications(workspace.id, workspace.slug);

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
