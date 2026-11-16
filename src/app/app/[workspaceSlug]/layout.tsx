import { after } from "next/server";
import { syncBillNotifications } from "@/actions/notifications";
import {
  updateProfileAction,
  updateWorkspaceSettingsAction,
} from "@/actions/settings";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { prisma } from "@/lib/prisma";
import { loadWorkspaceShellMeta } from "@/lib/workspace/shell-data";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, user, unreadCount, moneyInLabel, isOwner } =
    await loadWorkspaceShellMeta(workspaceSlug);

  after(() => {
    void syncBillNotifications(workspace.id, workspace.slug);
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  const workspaceAction = updateWorkspaceSettingsAction.bind(
    null,
    workspace.slug,
  );

  return (
    <WorkspaceShell
      workspaceSlug={workspace.slug}
      workspaceName={workspace.name}
      unreadCount={unreadCount}
      moneyInLabel={moneyInLabel}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        href: n.href,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      }))}
      isOwner={isOwner}
      currency={workspace.currency}
      profileName={user.name ?? ""}
      workspaceAction={workspaceAction}
      profileAction={updateProfileAction}
    >
      {children}
    </WorkspaceShell>
  );
}
