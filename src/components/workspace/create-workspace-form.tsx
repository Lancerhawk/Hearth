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
          Create a household space for shared budgets and bills.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Our Home"
              required
              disabled={pending}
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
              defaultValue="INR"
              maxLength={3}
              disabled={pending}
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
