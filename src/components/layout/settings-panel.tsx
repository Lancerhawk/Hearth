"use client";

import type { SettingsActionState } from "@/actions/settings";
import {
  ProfileSettingsForm,
  WorkspaceSettingsForm,
} from "@/components/settings/settings-forms";

export function SettingsPanel({
  isOwner,
  workspaceName,
  currency,
  profileName,
  workspaceAction,
  profileAction,
}: {
  isOwner: boolean;
  workspaceName: string;
  currency: string;
  profileName: string;
  workspaceAction: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
  profileAction: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {isOwner ? (
        <WorkspaceSettingsForm
          action={workspaceAction}
          name={workspaceName}
          currency={currency}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Only the owner can change workspace name and currency.
        </p>
      )}

      <ProfileSettingsForm action={profileAction} name={profileName} />
    </div>
  );
}
