import { after } from "next/server";
import { syncBillNotifications } from "@/actions/notifications";
import {
  updateProfileAction,
  updateWorkspaceSettingsAction,
} from "@/actions/settings";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { requireMembership } from "@/lib/budget/access";
import { prisma } from "@/lib/prisma";
import { moneyInLabel } from "@/lib/workspace/labels";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, user, membership } =
    await requireMembership(workspaceSlug);

  // Don't block navigation on bill-alert sync (was N+1 queries every click).
  after(() => {
    void syncBillNotifications(workspace.id, workspace.slug);
  });

  const [unreadCount, notifications] = await Promise.all([
    prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
        OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
      },
    }),
    prisma.notification.findMany({
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
    }),
  ]);

  const workspaceAction = updateWorkspaceSettingsAction.bind(
    null,
    workspace.slug,
  );

  return (
    <WorkspaceShell
      workspaceSlug={workspace.slug}
      workspaceName={workspace.name}
      unreadCount={unreadCount}
      moneyInLabel={moneyInLabel(workspace.kind)}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        href: n.href,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      }))}
      isOwner={membership.role === "OWNER"}
      currency={workspace.currency}
      profileName={user.name ?? ""}
      workspaceAction={workspaceAction}
      profileAction={updateProfileAction}
    >
      {children}
    </WorkspaceShell>
  );
}
