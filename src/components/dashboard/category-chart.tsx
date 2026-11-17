"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CategoryChart({
  data,
}: {
  data: Array<{ name: string; amount: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-hearth-ink/55">No expense categories yet.</p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fill: "color-mix(in srgb, var(--hearth-ink) 55%, transparent)",
            }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
            axisLine={{
              stroke: "color-mix(in srgb, var(--hearth-ink) 12%, transparent)",
            }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fill: "color-mix(in srgb, var(--hearth-ink) 55%, transparent)",
            }}
            width={40}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "color-mix(in srgb, var(--hearth-paper) 40%, white)",
              border:
                "1px solid color-mix(in srgb, var(--hearth-ink) 10%, transparent)",
              borderRadius: "0.75rem",
              boxShadow: "none",
            }}
          />
          <Bar
            dataKey="amount"
            fill="var(--hearth-moss)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
