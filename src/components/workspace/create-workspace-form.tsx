"use client";

import { useActionState } from "react";
import {
  createWorkspaceAction,
  type WorkspaceActionState,
} from "@/actions/workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: WorkspaceActionState = {};

export function CreateWorkspaceForm() {
  const [state, formAction, pending] = useActionState(
    createWorkspaceAction,
    initialState,
  );

  return (
    <Card className="w-full max-w-lg border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">New workspace</CardTitle>
        <CardDescription>
          Home spaces use Funds. Solo spaces use Income — same feature, clearer
          naming.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Who is this for?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border/80 bg-card/60 px-3 py-3 has-[:checked]:border-hearth-moss has-[:checked]:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="kind"
                    value="HOME"
                    defaultChecked={(state.values?.kind ?? "HOME") === "HOME"}
                    disabled={pending}
                  />
                  Home
                </span>
                <span className="pl-5 text-xs text-muted-foreground">
                  Household — money in is labeled Funds
                </span>
              </label>
              <label className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border/80 bg-card/60 px-3 py-3 has-[:checked]:border-hearth-moss has-[:checked]:bg-[color-mix(in_srgb,var(--hearth-moss)_10%,var(--hearth-paper))]">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="kind"
                    value="PERSONAL"
                    defaultChecked={state.values?.kind === "PERSONAL"}
                    disabled={pending}
                  />
                  Just you
                </span>
                <span className="pl-5 text-xs text-muted-foreground">
                  Solo — money in is labeled Income
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
            <Label htmlFor="name">Workspace name</Label>
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
            <Label htmlFor="currency">Currency</Label>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create workspace"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
