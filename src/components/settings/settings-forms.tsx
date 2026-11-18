"use client";

import { useActionState } from "react";
import type { SettingsActionState } from "@/actions/settings";
import { FormBanner } from "@/components/design/form-banner";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { useLocale, useT } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WorkspaceSettingsForm({
  action,
  name,
  currency,
}: {
  action: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
  name: string;
  currency: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Surface tone="quiet">
      <form action={formAction} className="space-y-3">
        <SectionTitle>{t("settings.workspace")}</SectionTitle>
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        {state.success ? (
          <FormBanner tone="success">{state.success}</FormBanner>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("settings.workspaceName")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={name}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">{t("settings.currency")}</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue={currency}
              maxLength={3}
              required
              disabled={pending}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </Surface>
  );
}

export function ProfileSettingsForm({
  action,
  name,
}: {
  action: (
    prev: SettingsActionState,
    formData: FormData,
  ) => Promise<SettingsActionState>;
  name: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Surface tone="quiet">
      <form action={formAction} className="space-y-3">
        <SectionTitle>{t("settings.profile")}</SectionTitle>
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        {state.success ? (
          <FormBanner tone="success">{state.success}</FormBanner>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">{t("settings.profileName")}</Label>
          <Input
            id="profile-name"
            name="name"
            defaultValue={name}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("settings.language")}</Label>
          <p className="text-xs text-hearth-ink/55">
            {t("settings.languageHint")}
          </p>
          <LocaleToggle locale={locale} className="mt-1" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t("common.loading") : t("common.save")}
        </Button>
      </form>
    </Surface>
  );
}
