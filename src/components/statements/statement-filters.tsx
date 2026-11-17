import Link from "next/link";
import { FilterChip } from "@/components/design/filter-chip";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  monthDateBounds,
  statementKindLabel,
  statementQuery,
  type StatementFilters,
  type StatementKind,
} from "@/lib/statements/filters";
import { cn } from "@/lib/utils";

export function StatementFiltersForm({
  basePath,
  csvPath,
  filters,
  moneyInLabel,
  categories,
  members,
}: {
  basePath: string;
  csvPath: string;
  filters: StatementFilters;
  moneyInLabel: string;
  categories: Array<{ id: string; name: string }>;
  members: Array<{ id: string; label: string }>;
}) {
  const q = (patch: Partial<StatementFilters>) =>
    `${basePath}?${statementQuery({ ...filters, ...patch })}`;

  const kindOrder: StatementKind[] = [
    "full",
    "income",
    "spent",
    "expenses",
    "charges",
    "savings",
    "bills",
  ];

  return (
    <div className="no-print flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {kindOrder.map((kind) => (
          <FilterChip
            key={kind}
            href={q({ kind })}
            active={filters.kind === kind}
          >
            {statementKindLabel(kind, moneyInLabel)}
          </FilterChip>
        ))}
      </div>

      <form
        method="get"
        action={basePath}
        className="grid gap-3 rounded-xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_88%,white)] p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input type="hidden" name="year" value={filters.year} />
        <input type="hidden" name="month" value={filters.month} />
        <input type="hidden" name="kind" value={filters.kind} />

        <div className="space-y-1.5">
          <Label htmlFor="statement-from">From</Label>
          <Input
            id="statement-from"
            type="date"
            name="from"
            defaultValue={filters.from}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="statement-to">To</Label>
          <Input
            id="statement-to"
            type="date"
            name="to"
            defaultValue={filters.to}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="statement-category">Category</Label>
          <select
            id="statement-category"
            name="categoryId"
            defaultValue={filters.categoryId}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="statement-member">Added by</Label>
          <select
            id="statement-member"
            name="member"
            defaultValue={filters.member}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="statement-bill-status">Bills</Label>
          <select
            id="statement-bill-status"
            name="billStatus"
            defaultValue={filters.billStatus}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="all">All bill statuses</option>
            <option value="paid">Paid only</option>
            <option value="pending">Pending only</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <PendingSubmitButton className="w-full" pendingLabel="Applying…">
            Apply filters
          </PendingSubmitButton>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <MonthNav basePath={basePath} filters={filters} />
        <Link
          href={`${csvPath}?${statementQuery(filters)}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Download CSV
        </Link>
      </div>
    </div>
  );
}

function MonthNav({
  basePath,
  filters,
}: {
  basePath: string;
  filters: StatementFilters;
}) {
  const prev =
    filters.month === 1
      ? { year: filters.year - 1, month: 12 }
      : { year: filters.year, month: filters.month - 1 };
  const next =
    filters.month === 12
      ? { year: filters.year + 1, month: 1 }
      : { year: filters.year, month: filters.month + 1 };

  const label = new Date(filters.year, filters.month - 1, 1).toLocaleString(
    "en",
    { month: "long", year: "numeric" },
  );

  // Month nav resets the date range to that month’s bounds.
  const hrefFor = (year: number, month: number) => {
    const bounds = monthDateBounds(year, month);
    return `${basePath}?${statementQuery({
      ...filters,
      year,
      month,
      from: bounds.from,
      to: bounds.to,
    })}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={hrefFor(prev.year, prev.month)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        ←
      </Link>
      <p className="min-w-40 text-center font-heading text-lg">{label}</p>
      <Link
        href={hrefFor(next.year, next.month)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        →
      </Link>
    </div>
  );
}
