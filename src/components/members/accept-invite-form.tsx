"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "@/actions/invites";
import { FormBanner } from "@/components/design/form-banner";
import { Button } from "@/components/ui/button";

export function AcceptInviteForm({ token }: { token: string }) {
  const bound = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string }, formData: FormData) => {
      void prev;
      void formData;
      const result = await bound();
      if (result && "error" in result) return { error: result.error };
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-3">
      {state.error ? <FormBanner tone="error">{state.error}</FormBanner> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Joining…" : "Accept invite"}
      </Button>
    </form>
  );
}
