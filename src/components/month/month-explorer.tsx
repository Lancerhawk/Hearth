"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { MoneyList } from "@/components/design/money-list";
import { SectionTitle } from "@/components/design/section-title";
import { Surface } from "@/components/design/surface";
import { MonthCalendar } from "@/components/month/month-calendar";
import type { DayBucket } from "@/lib/budget/day-map";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export type MonthActivityRow = {
  id: string;
  title: string;
  amount: number;
  date: string;
  kind: string;
  category?: string;
  addedBy: string;
  createdById: string;
};

export type MonthMemberOption = {
  userId: string;
  label: string;
};

function buildQuery(
  year: number,
  month: number,
  view: "calendar" | "list",
  selectedDay: number | undefined,
  memberFilter: string,
) {
  const p = new URLSearchParams();
  p.set("year", String(year));
  p.set("month", String(month));
  p.set("view", view);
  if (view === "calendar" && selectedDay) p.set("day", String(selectedDay));
  if (memberFilter) p.set("member", memberFilter);
  return `?${p.toString()}`;
}

/** Update the address bar without a Next.js navigation / RSC refetch. */
function replaceUrl(href: string) {
  if (typeof window === "undefined") return;
  if (`${window.location.pathname}${window.location.search}` === href) return;
  window.history.replaceState(window.history.state, "", href);
}

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

export function MonthExplorer({
  year,
  month,
  currency,
  workspaceSlug,
  base,
  dayMap,
  activity,
  members,
  initialView,
  initialDay,
  initialMember,
}: {
  year: number;
  month: number;
  currency: string;
  workspaceSlug: string;
  base: string;
  dayMap: Record<string, DayBucket>;
  activity: MonthActivityRow[];
  members: MonthMemberOption[];
  initialView: "calendar" | "list";
  initialDay?: number;
  initialMember: string;
}) {
  const [view, setView] = useState<"calendar" | "list">(initialView);
  const [selectedDay, setSelectedDay] = useState<number | undefined>(
    initialDay,
  );
  const [memberFilter, setMemberFilter] = useState(initialMember);

  const syncUrl = useCallback(
    (next: { view: "calendar" | "list"; day?: number; member: string }) => {
      replaceUrl(
        `${base}${buildQuery(year, month, next.view, next.day, next.member)}`,
      );
    },
    [base, month, year],
  );

  const filtered = activity
    .filter((row) => (memberFilter ? row.createdById === memberFilter : true))
    .filter((row) =>
      selectedDay && view === "calendar"
        ? Number(row.date.slice(-2)) === selectedDay
        : true,
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          active={view === "calendar"}
          onClick={() => {
            setView("calendar");
            syncUrl({
              view: "calendar",
              day: selectedDay,
              member: memberFilter,
            });
          }}
        >
          Calendar
        </Chip>
        <Chip
          active={view === "list"}
          onClick={() => {
            setView("list");
            setSelectedDay(undefined);
            syncUrl({ view: "list", day: undefined, member: memberFilter });
          }}
        >
          List
        </Chip>
        <Chip
          active={!memberFilter}
          onClick={() => {
            setMemberFilter("");
            syncUrl({
              view,
              day: view === "calendar" ? selectedDay : undefined,
              member: "",
            });
          }}
        >
          Everyone
        </Chip>
        {members.map((m) => (
          <Chip
            key={m.userId}
            active={memberFilter === m.userId}
            onClick={() => {
              setMemberFilter(m.userId);
              syncUrl({
                view,
                day: view === "calendar" ? selectedDay : undefined,
                member: m.userId,
              });
            }}
          >
            {m.label}
          </Chip>
        ))}
      </div>

      {view === "list" ? (
        <MoneyList
          emptyTitle="No activity this month"
          items={filtered.map((row) => ({
            id: row.id,
            title: row.title,
            meta: `${row.date} · ${row.kind}${row.category ? ` · ${row.category}` : ""}${row.date > new Date().toISOString().slice(0, 10) ? " · Upcoming" : ""} · added by ${row.addedBy}`,
            amount: formatCurrency(row.amount, currency),
          }))}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Surface padding="sm">
            <MonthCalendar
              year={year}
              month={month}
              dayMap={dayMap}
              currency={currency}
              selectedDay={selectedDay}
              onSelectDay={(day) => {
                const next = selectedDay === day ? undefined : day;
                setSelectedDay(next);
                syncUrl({
                  view: "calendar",
                  day: next,
                  member: memberFilter,
                });
              }}
            />
          </Surface>
          <Surface>
            <SectionTitle>
              {selectedDay ? `Day ${selectedDay}` : "Pick a day"}
            </SectionTitle>
            <ul className="mt-3 space-y-2">
              {filtered.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  {selectedDay
                    ? "Nothing logged."
                    : "Select a day on the calendar."}
                </li>
              ) : (
                filtered.map((row) => (
                  <li key={row.id} className="text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-hearth-ink">
                        {row.title}
                      </span>
                      <span className="font-heading text-hearth-ink">
                        {formatCurrency(row.amount, currency)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {row.kind}
                      {row.category ? ` · ${row.category}` : ""} · {row.addedBy}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <Link
              href={`/app/${workspaceSlug}/expenses?year=${year}&month=${month}`}
              className="mt-4 inline-block text-sm text-hearth-moss underline-offset-4 hover:underline"
            >
              Add expense
            </Link>
          </Surface>
        </div>
      )}
    </div>
  );
}
