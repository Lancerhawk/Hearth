"use client";

import { useActionState } from "react";
import type { SettingsActionState } from "@/actions/settings";
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
    <form action={formAction} className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
      <h2 className="font-heading text-xl">Workspace</h2>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-primary">{state.success}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={name} required disabled={pending} />
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
    <form action={formAction} className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
      <h2 className="font-heading text-xl">Profile</h2>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-primary">{state.success}</p>
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
  );
}
