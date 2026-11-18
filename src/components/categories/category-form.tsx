"use client";

import { useActionState } from "react";
import type { CategoryActionState } from "@/actions/categories";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { useT } from "@/components/i18n/locale-provider";
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
  const t = useT();
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
            <Label htmlFor="name">{t("categories.name")}</Label>
            <Input
              id="name"
              name="name"
              required
              disabled={pending}
              placeholder="Groceries"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">{t("workspaces.kindLabel")}</Label>
            <select
              id="type"
              name="type"
              className="h-8 w-full rounded-lg border border-input bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)] px-2 text-sm text-hearth-ink"
              defaultValue="EXPENSE"
              disabled={pending}
            >
              <option value="EXPENSE">{t("categories.typeExpense")}</option>
              <option value="CHARGE">{t("categories.typeCharge")}</option>
              <option value="SAVINGS">{t("money.savingsTitle")}</option>
              <option value="INCOME">{t("money.incomeTitle")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="color">{t("categories.color")}</Label>
            <Input
              id="color"
              name="color"
              placeholder="#355C45"
              disabled={pending}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t("common.loading") : t("categories.add")}
        </Button>
      </form>
    </Surface>
  );
}
