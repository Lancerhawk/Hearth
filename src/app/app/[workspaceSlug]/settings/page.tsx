import type { Metadata } from "next";
import {
  updateProfileAction,
  updateWorkspaceSettingsAction,
} from "@/actions/settings";
import { PageHeader } from "@/components/design/page-header";
import {
  ProfileSettingsForm,
  WorkspaceSettingsForm,
} from "@/components/settings/settings-forms";
import { requireMembership, requireUser } from "@/lib/budget/access";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { workspace, membership } = await requireMembership(workspaceSlug);
  const user = await requireUser();
  const isOwner = membership.role === "OWNER";
  const workspaceAction = updateWorkspaceSettingsAction.bind(
    null,
    workspaceSlug,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Workspace and profile preferences."
      />

      {isOwner ? (
        <WorkspaceSettingsForm
          action={workspaceAction}
          name={workspace.name}
          currency={workspace.currency}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Only the owner can change workspace name and currency.
        </p>
      )}

      <ProfileSettingsForm
        action={updateProfileAction}
        name={user.name ?? ""}
      />
    </div>
  );
}
