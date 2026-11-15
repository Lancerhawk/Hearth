"use client";

import { useActionState } from "react";
import type { SettingsActionState } from "@/actions/settings";
import { FormBanner } from "@/components/design/form-banner";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
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
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Surface>
      <form action={formAction} className="space-y-3">
        <SectionTitle>Workspace</SectionTitle>
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        {state.success ? (
          <FormBanner tone="success">{state.success}</FormBanner>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={name}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
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
          {pending ? "Saving…" : "Save workspace"}
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
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Surface>
      <form action={formAction} className="space-y-3">
        <SectionTitle>Profile</SectionTitle>
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        {state.success ? (
          <FormBanner tone="success">{state.success}</FormBanner>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            name="name"
            defaultValue={name}
            required
            disabled={pending}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </Surface>
  );
}
