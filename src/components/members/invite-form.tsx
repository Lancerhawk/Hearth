"use client";

import { useActionState } from "react";
import type { InviteActionState } from "@/actions/invites";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({
  action,
}: {
  action: (
    prev: InviteActionState,
    formData: FormData,
  ) => Promise<InviteActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Surface>
      <form action={formAction} className="space-y-3">
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}
        {state.success ? (
          <FormBanner tone="success">{state.success}</FormBanner>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
              defaultValue="MEMBER"
              disabled={pending}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </div>
      </form>
    </Surface>
  );
}
