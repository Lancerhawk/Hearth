"use client";

import { useActionState } from "react";
import type { CategoryActionState } from "@/actions/categories";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryForm({
  action,
}: {
  action: (
    prev: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Surface tone="quiet">
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
            <Input
              id="name"
              name="name"
              required
              disabled={pending}
              placeholder="Groceries"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              className="h-8 w-full rounded-lg border border-input bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)] px-2 text-sm text-hearth-ink"
              defaultValue="EXPENSE"
              disabled={pending}
            >
              <option value="EXPENSE">Expense</option>
              <option value="CHARGE">Charge</option>
              <option value="SAVINGS">Savings</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              placeholder="#355C45"
              disabled={pending}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add category"}
        </Button>
      </form>
    </Surface>
  );
}
