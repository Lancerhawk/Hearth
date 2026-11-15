"use client";

import { useActionState, useState } from "react";
import type { BillActionState } from "@/actions/bills";
import { BillForm, type BillFormDefaults } from "@/components/bills/bill-form";
import { FormBanner } from "@/components/design/form-banner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecurringBillEditButton({
  defaults,
  updateAction,
}: {
  defaults: BillFormDefaults;
  updateAction: (
    prev: BillActionState,
    formData: FormData,
  ) => Promise<BillActionState>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="sm" variant="ghost" />}
      >
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit bill template</DialogTitle>
        </DialogHeader>
        {open ? (
          <BillForm
            key="edit-template"
            action={updateAction}
            defaults={defaults}
            submitLabel="Save changes"
            bare
            onSuccess={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function BillInstanceEditButton({
  amount,
  updateAction,
}: {
  amount: string;
  updateAction: (
    prev: BillActionState,
    formData: FormData,
  ) => Promise<BillActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: BillActionState, formData: FormData) => {
      const result = await updateAction(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="sm" variant="ghost" />}
      >
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit this month&apos;s amount</DialogTitle>
        </DialogHeader>
        {open ? (
          <form key="edit-instance" action={formAction} className="space-y-3">
            {state.error ? (
              <FormBanner tone="error">{state.error}</FormBanner>
            ) : null}
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
                defaultValue={amount}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
