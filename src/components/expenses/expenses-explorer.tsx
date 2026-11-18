"use client";

import { useState } from "react";
import { MoneyList } from "@/components/design/money-list";
import { useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export type ExpenseListItem = {
  id: string;
  title: string;
  meta: string;
  amount: string;
  createdById: string;
  action: React.ReactNode;
};

function MemberChip({
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
        "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
        active
          ? "border-hearth-moss/40 bg-[color-mix(in_srgb,var(--hearth-moss)_14%,var(--hearth-paper))] text-hearth-ink"
          : "border-border/80 text-hearth-ink/60 hover:border-hearth-moss/35 hover:text-hearth-ink",
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
  const t = useT();
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <MemberChip active={!memberFilter} onClick={() => selectMember("")}>
          {t("common.everyone")}
        </MemberChip>
        {members.map((m) => (
          <MemberChip
            key={m.userId}
            active={memberFilter === m.userId}
            onClick={() => selectMember(m.userId)}
          >
            {m.label}
          </MemberChip>
        ))}
      </div>

      <MoneyList
        emptyTitle={t("money.noExpenses")}
        emptyDescription={t("money.noExpensesBody")}
        items={rows.map((row) => ({
          id: row.id,
          title: row.title,
          meta: row.meta,
          amount: row.amount,
          action: row.action,
        }))}
      />
    </div>
  );
}
