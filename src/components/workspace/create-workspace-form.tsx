"use client";

import { useActionState } from "react";
import {
  createWorkspaceAction,
  type WorkspaceActionState,
} from "@/actions/workspaces";
import { FormBanner } from "@/components/design/form-banner";
import { Surface } from "@/components/design/surface";
import { useT } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: WorkspaceActionState = {};

export function CreateWorkspaceForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(
    createWorkspaceAction,
    initialState,
  );

  return (
    <Surface tone="quiet" padding="lg" className="w-full max-w-lg">
      <h1 className="font-heading text-[2rem] tracking-tight text-hearth-ink md:text-3xl">
        {t("workspaces.createTitle")}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-hearth-ink/60">
        {t("workspaces.emptyBody")}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        {state.error ? (
          <FormBanner tone="error">{state.error}</FormBanner>
        ) : null}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-hearth-ink">
            {t("workspaces.kindLabel")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border px-3 py-3 transition-colors",
                "border-border/80 bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)]",
                "has-[:checked]:border-hearth-moss/45 has-[:checked]:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-hearth-ink">
                <input
                  type="radio"
                  name="kind"
                  value="HOME"
                  defaultChecked={(state.values?.kind ?? "HOME") === "HOME"}
                  disabled={pending}
                />
                {t("workspaces.kindHome")}
              </span>
              <span className="pl-5 text-xs text-hearth-ink/55">
                {t("money.fundsDescription")}
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border px-3 py-3 transition-colors",
                "border-border/80 bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)]",
                "has-[:checked]:border-hearth-moss/45 has-[:checked]:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-hearth-ink">
                <input
                  type="radio"
                  name="kind"
                  value="PERSONAL"
                  defaultChecked={state.values?.kind === "PERSONAL"}
                  disabled={pending}
                />
                {t("workspaces.kindPersonal")}
              </span>
              <span className="pl-5 text-xs text-hearth-ink/55">
                {t("money.incomeDescription")}
              </span>
            </label>
          </div>
          {state.fieldErrors?.kind?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.kind[0]}
            </p>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="name">{t("workspaces.nameLabel")}</Label>
          <Input
            id="name"
            name="name"
            placeholder="Our Home"
            required
            disabled={pending}
            defaultValue={state.values?.name}
            key={`name-${state.values?.name ?? "empty"}-${state.error ?? "ok"}`}
          />
          {state.fieldErrors?.name?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t("workspaces.currencyLabel")}</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={state.values?.currency ?? "INR"}
            maxLength={3}
            disabled={pending}
            key={`currency-${state.values?.currency ?? "INR"}-${state.error ?? "ok"}`}
          />
          {state.fieldErrors?.currency?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.currency[0]}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t("common.loading") : t("workspaces.create")}
        </Button>
      </form>
    </Surface>
  );
}
