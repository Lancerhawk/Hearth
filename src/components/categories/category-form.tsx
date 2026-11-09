"use client";

import { useActionState } from "react";
import type { CategoryActionState } from "@/actions/categories";
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
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
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
          <Input id="color" name="color" placeholder="#6b7c5a" disabled={pending} />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add category"}
      </Button>
    </form>
  );
}
