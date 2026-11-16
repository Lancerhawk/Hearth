import { after } from "next/server";
import { syncBillNotifications } from "@/actions/notifications";
import {
  updateProfileAction,
  updateWorkspaceSettingsAction,
} from "@/actions/settings";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
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
