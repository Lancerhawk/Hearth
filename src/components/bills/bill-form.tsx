"use client";

import { useActionState } from "react";
import type { BillActionState } from "@/actions/bills";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BillForm({
  action,
}: {
  action: (
    prev: BillActionState,
    formData: FormData,
  ) => Promise<BillActionState>;
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
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dayOfMonth">Day of month</Label>
            <Input
              id="dayOfMonth"
              name="dayOfMonth"
              type="number"
              min={1}
              max={28}
              defaultValue={1}
              required
              disabled={pending}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add recurring bill"}
        </Button>
      </form>
    </Surface>
  );
}
