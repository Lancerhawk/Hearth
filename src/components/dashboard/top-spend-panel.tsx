"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TopSpendRanking,
  type TopSpendRow,
} from "@/components/dashboard/top-spend-ranking";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "graph";

export function TopSpendPanel({
  rows,
  currency,
  totalSpent,
}: {
  rows: TopSpendRow[];
  currency: string;
  totalSpent: number;
}) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-xl tracking-tight text-hearth-ink">
            Top spend this month
          </h2>
          <p className="mt-1 text-xs text-hearth-ink/50">
            Committed so far — future-dated rows stay under Upcoming.
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-border/80 p-0.5"
          role="group"
          aria-label="Top spend view"
        >
          <ToggleButton
            active={view === "list"}
            onClick={() => setView("list")}
          >
            List
          </ToggleButton>
          <ToggleButton
            active={view === "graph"}
            onClick={() => setView("graph")}
          >
            Graph
          </ToggleButton>
        </div>
      </div>

      <div className="mt-4">
        {view === "list" ? (
          <TopSpendRanking
            rows={rows}
            currency={currency}
            totalSpent={totalSpent}
          />
        ) : (
          <TopSpendGraph rows={rows} currency={currency} />
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[color-mix(in_srgb,var(--hearth-moss)_16%,var(--hearth-paper))] text-hearth-ink"
          : "text-hearth-ink/55 hover:text-hearth-ink",
      )}
    >
      {children}
    </button>
  );
}

function TopSpendGraph({
  rows,
  currency,
}: {
  rows: TopSpendRow[];
  currency: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-hearth-ink/55">
        No committed spend this month yet.
      </p>
    );
  }

  const data = [...rows].reverse();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="color-mix(in srgb, var(--hearth-moss) 18%, white)"
          />
          <XAxis
            type="number"
            tickFormatter={(v: number) =>
              formatCurrency(v, currency).replace(/\.00$/, "")
            }
            tick={{
              fill: "color-mix(in srgb, var(--hearth-ink) 45%, white)",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: "var(--hearth-ink)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{
              fill: "color-mix(in srgb, var(--hearth-moss) 8%, white)",
            }}
            formatter={(value) => [
              formatCurrency(Number(value ?? 0), currency),
              "Spent",
            ]}
            contentStyle={{
              borderRadius: 12,
              border:
                "1px solid color-mix(in srgb, var(--hearth-moss) 20%, white)",
              background: "var(--hearth-paper)",
              color: "var(--hearth-ink)",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="amount"
            fill="var(--hearth-moss)"
            radius={[0, 6, 6, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
