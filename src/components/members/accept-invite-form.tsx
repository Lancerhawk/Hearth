"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "@/actions/invites";
import { Button } from "@/components/ui/button";

export function AcceptInviteForm({ token }: { token: string }) {
  const bound = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, _formData: FormData) => {
      const result = await bound();
      if (result && "error" in result) return { error: result.error };
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-3">
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Accept invite"}
      </Button>
    </form>
  );
}
