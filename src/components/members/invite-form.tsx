"use client";

import { useActionState } from "react";
import type { InviteActionState } from "@/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({
  action,
}: {
  action: (prev: InviteActionState, formData: FormData) => Promise<InviteActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.success}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required disabled={pending} />
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
  );
}
