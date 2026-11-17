"use client";

import { useState } from "react";
import { MoneyList } from "@/components/design/money-list";
import { cn } from "@/lib/utils";

export type ExpenseListItem = {
  id: string;
  title: string;
  meta: string;
  amount: string;
  createdById: string;
  action: React.ReactNode;
};

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-hearth-moss bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
          : "border-border text-muted-foreground hover:border-hearth-moss/40 hover:text-hearth-ink",
      )}
    >
      {children}
    </button>
  );
}

export function ExpensesExplorer({
  base,
  year,
  month,
  members,
  items,
  initialMember,
}: {
  base: string;
  year: number;
  month: number;
  members: Array<{ userId: string; label: string }>;
  items: ExpenseListItem[];
  initialMember: string;
}) {
  const [memberFilter, setMemberFilter] = useState(initialMember);

  function selectMember(member: string) {
    setMemberFilter(member);
    const p = new URLSearchParams();
    p.set("year", String(year));
    p.set("month", String(month));
    if (member) p.set("member", member);
    const href = `${base}?${p.toString()}`;
    if (typeof window !== "undefined") {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== href) {
        window.history.replaceState(window.history.state, "", href);
      }
    }
  }

  const rows = memberFilter
    ? items.filter((item) => item.createdById === memberFilter)
    : items;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Chip active={!memberFilter} onClick={() => selectMember("")}>
          Everyone
        </Chip>
        {members.map((m) => (
          <Chip
            key={m.userId}
            active={memberFilter === m.userId}
            onClick={() => selectMember(m.userId)}
          >
            {m.label}
          </Chip>
        ))}
      </div>

      <MoneyList
        emptyTitle="No expenses this month"
        emptyDescription="Log a purchase to see it here with who added it."
        items={rows.map((row) => ({
          id: row.id,
          title: row.title,
          meta: row.meta,
          amount: row.amount,
          action: row.action,
        }))}
      />
    </>
  );
}
