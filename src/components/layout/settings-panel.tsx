"use client";

import type { SettingsActionState } from "@/actions/settings";
import {
  ProfileSettingsForm,
  WorkspaceSettingsForm,
} from "@/components/settings/settings-forms";
import { useT } from "@/components/i18n/locale-provider";

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
  const t = useT();
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
          {t("settings.description")}
        </p>
      )}

      <ProfileSettingsForm action={profileAction} name={profileName} />
    </div>
  );
}
