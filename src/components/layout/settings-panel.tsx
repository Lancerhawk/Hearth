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
        <p className="rounded-2xl border border-dashed border-border/80 bg-[color-mix(in_srgb,var(--hearth-paper)_45%,white)] px-4 py-5 text-sm text-hearth-ink/55">
          Only the owner can change workspace name and currency.
        </p>
      )}

      <ProfileSettingsForm action={profileAction} name={profileName} />
    </div>
  );
}
