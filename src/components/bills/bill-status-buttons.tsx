"use client";

import { useOptimistic, useTransition } from "react";
import {
  setBillStatusAction,
  toggleRecurringBillAction,
} from "@/actions/bills";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "PAID", "SKIPPED"] as const;
type BillStatus = (typeof STATUSES)[number];

export function BillStatusButtons({
  workspaceSlug,
  instanceId,
  status,
}: {
  workspaceSlug: string;
  instanceId: string;
  status: BillStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  function setStatus(next: BillStatus) {
    if (next === optimisticStatus || isPending) return;
    startTransition(async () => {
      setOptimisticStatus(next);
      await setBillStatusAction(workspaceSlug, instanceId, next);
    });
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-busy={isPending}
    >
      {STATUSES.map((s) => (
        <Button
          key={s}
          type="button"
          size="sm"
          variant={optimisticStatus === s ? "default" : "outline"}
          disabled={isPending}
          aria-pressed={optimisticStatus === s}
          onClick={() => setStatus(s)}
        >
          {s.toLowerCase()}
        </Button>
      ))}
    </div>
  );
}

export function BillActiveToggle({
  workspaceSlug,
  billId,
  isActive,
}: {
  workspaceSlug: string;
  billId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(isActive);

  function toggle() {
    if (isPending) return;
    const next = !optimisticActive;
    startTransition(async () => {
      setOptimisticActive(next);
      await toggleRecurringBillAction(workspaceSlug, billId, next);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={toggle}
    >
      {isPending
        ? "Updating…"
        : optimisticActive
          ? "Deactivate"
          : "Activate"}
    </Button>
  );
}
