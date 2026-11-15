"use client";

import { useState } from "react";
import type { EntryActionState, EntryKind } from "@/actions/entries";
import {
  EntryForm,
  type EntryFormDefaults,
} from "@/components/entries/entry-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CategoryOption = { id: string; name: string };

export function EntryRowActions({
  type,
  defaults,
  showCategory,
  categories,
  updateAction,
  onDelete,
}: {
  type: EntryKind;
  defaults: EntryFormDefaults & { date: string };
  showCategory?: boolean;
  categories?: CategoryOption[];
  updateAction: (
    prev: EntryActionState,
    formData: FormData,
  ) => Promise<EntryActionState>;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const label =
    type === "expense"
      ? "expense"
      : type === "income"
        ? "income"
        : type === "savings"
          ? "savings"
          : "charge";

  return (
    <div className="flex items-center gap-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<Button type="button" size="sm" variant="ghost" />}
        >
          Edit
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit {label}</DialogTitle>
          </DialogHeader>
          {open ? (
            <EntryForm
              key="edit-entry"
              action={updateAction}
              categories={categories}
              defaultDate={defaults.date}
              defaults={defaults}
              showCategory={showCategory}
              submitLabel="Save changes"
              bare
              onSuccess={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <form action={onDelete}>
        <Button type="submit" size="sm" variant="ghost">
          Delete
        </Button>
      </form>
    </div>
  );
}
