"use client";

import { useActionState } from "react";
import type { EntryActionState } from "@/actions/entries";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryOption = { id: string; name: string };

export type EntryFormDefaults = {
  title?: string;
  amount?: string;
  date?: string;
  note?: string;
  categoryId?: string;
};

export function EntryForm({
  action,
  categories,
  defaultDate,
  defaults,
  showCategory,
  submitLabel,
  bare = false,
  onSuccess,
}: {
  action: (
    prev: EntryActionState,
    formData: FormData,
  ) => Promise<EntryActionState>;
  categories?: CategoryOption[];
  defaultDate: string;
  defaults?: EntryFormDefaults;
  showCategory?: boolean;
  submitLabel: string;
  bare?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: EntryActionState, formData: FormData) => {
      const result = await action(prev, formData);
      if (result.success) onSuccess?.();
      return result;
    },
    {},
  );

  const form = (
    <form action={formAction} className="space-y-3">
      {state.error ? <FormBanner tone="error">{state.error}</FormBanner> : null}
      {state.success ? (
        <FormBanner tone="success">{state.success}</FormBanner>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            disabled={pending}
            defaultValue={defaults?.title ?? ""}
          />
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
            defaultValue={defaults?.amount ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">When</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaults?.date ?? defaultDate}
            required
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            Filed under the month of this date (not the month you’re viewing).
          </p>
        </div>
        {showCategory ? (
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
              disabled={pending}
              defaultValue={defaults?.categoryId ?? ""}
            >
              <option value="">None</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
          disabled={pending}
          defaultValue={defaults?.note ?? ""}
        />
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );

  if (bare) return form;
  return <Surface tone="quiet">{form}</Surface>;
}
