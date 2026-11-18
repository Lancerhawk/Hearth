import { Surface } from "@/components/design/surface";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import type { Locale } from "@/i18n/config";
import { formatCurrency } from "@/lib/money";
import {
  formatSignedAmount,
  type StatementRow,
  type StatementTotals,
} from "@/lib/statements/build-rows";
import {
  statementKindLabel,
  statementQuery,
  type StatementFilters,
} from "@/lib/statements/filters";
import { loadFilteredStatement } from "@/lib/statements/load-statement";
import { cn } from "@/lib/utils";

export async function StatementDocument({
  workspaceId,
  workspaceName,
  currency,
  fundsLabel,
  filters,
  chips,
}: {
  workspaceId: string;
  workspaceName: string;
  currency: string;
  fundsLabel: string;
  filters: StatementFilters;
  chips: string[];
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const tr = (path: string, vars?: Record<string, string | number>) =>
    t(dict, path, vars);
  const { rows, totals, range } = await loadFilteredStatement(
    workspaceId,
    filters,
  );
  const title = statementKindLabel(filters.kind, fundsLabel);
  const rangeLabel =
    range.from === range.to ? range.from : `${range.from} → ${range.to}`;
  const displayChips = range.clampedToToday
    ? [...chips, tr("statements.throughToday", { date: range.through })]
    : chips;

  return (
    <Surface
      padding="lg"
      className="statement-doc print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
    >
      <header className="mb-6 border-b border-border/70 pb-5">
        <p className="font-heading text-4xl tracking-tight text-hearth-ink">
          Hearth
        </p>
        <p className="mt-1 text-lg text-hearth-ink">{workspaceName}</p>
        <p className="text-sm text-hearth-ink/55">
          {title} · {currency}
        </p>
        <p className="mt-1 text-sm text-hearth-ink/55">{rangeLabel}</p>
        {range.clampedToToday ? (
          <p className="mt-1 text-xs text-hearth-ink/50">
            {tr("statements.futureLeftOut")}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {displayChips.map((chip) => (
            <span
              key={chip}
              className="rounded-lg border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_50%,white)] px-2.5 py-0.5 text-[11px] text-hearth-ink/60"
            >
              {chip}
            </span>
          ))}
        </div>
      </header>

      <SummaryStrip
        totals={totals}
        currency={currency}
        locale={locale}
        tr={tr}
      />

      <div className="mt-6 space-y-3 md:hidden print:hidden">
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-hearth-ink/55">
            {tr("statements.nothingMatches")}
          </p>
        ) : (
          rows.map((row, i) => (
            <StatementMobileCard
              key={`${row.type}-${row.recordedAt}-${i}`}
              index={i + 1}
              row={row}
              currency={currency}
              locale={locale}
            />
          ))
        )}
        <MobileTotals
          totals={totals}
          currency={currency}
          locale={locale}
          tr={tr}
        />
      </div>

      <table className="mt-6 hidden w-full text-left text-sm md:table print:table">
        <thead>
          <tr className="border-b border-border/70 text-[11px] uppercase tracking-[0.1em] text-hearth-ink/45">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">
              {tr("statements.colDate")}
            </th>
            <th className="py-2 pr-2 font-medium">
              {tr("statements.colTitle")}
            </th>
            <th className="py-2 pr-2 font-medium">
              {tr("statements.colCategory")}
            </th>
            <th className="py-2 pr-2 font-medium">
              {tr("statements.colType")}
            </th>
            <th className="py-2 pr-2 text-right font-medium">
              {tr("statements.colAmount")}
            </th>
            <th className="py-2 pr-2 font-medium">
              {tr("statements.colAddedBy")}
            </th>
            <th className="py-2 font-medium">{tr("statements.colRecorded")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-hearth-ink/55">
                {tr("statements.nothingMatches")}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={`${row.type}-${row.recordedAt}-${i}`}
                className="border-b border-border/40"
              >
                <td className="py-2.5 pr-2 text-hearth-ink/50">{i + 1}</td>
                <td className="py-2.5 pr-2">{row.date}</td>
                <td className="py-2.5 pr-2 font-medium text-hearth-ink">
                  {row.title}
                </td>
                <td className="py-2.5 pr-2 text-hearth-ink/70">
                  {row.category}
                </td>
                <td className="py-2.5 pr-2 text-hearth-ink/70">{row.type}</td>
                <td
                  className={cn(
                    "py-2.5 pr-2 text-right tabular-money",
                    row.sign > 0 ? "text-hearth-ember" : "text-hearth-ink",
                  )}
                >
                  {formatSignedAmount(row, currency)}
                </td>
                <td className="py-2.5 pr-2 text-hearth-ink/70">
                  {row.addedBy}
                </td>
                <td className="py-2.5 text-xs text-hearth-ink/45">
                  {row.recordedAt.slice(0, 16).replace("T", " ")}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-border/70">
            <td colSpan={5} className="pt-4 font-medium text-hearth-ink">
              {tr("statements.netInOut")}
            </td>
            <td className="pt-4 text-right font-heading tabular-money text-hearth-ink">
              {formatSignedAmount(
                {
                  amount: Math.abs(totals.net),
                  sign: totals.net >= 0 ? 1 : -1,
                },
                currency,
              )}
            </td>
            <td colSpan={2} />
          </tr>
          {totals.pendingOutflow > 0 ? (
            <tr>
              <td colSpan={5} className="pt-1 text-sm text-hearth-ink/55">
                {tr("statements.pendingBillsNotInNet")}
              </td>
              <td className="pt-1 text-right text-sm tabular-money text-hearth-ink/55">
                {formatCurrency(totals.pendingOutflow, currency, locale)}
              </td>
              <td colSpan={2} />
            </tr>
          ) : null}
        </tfoot>
      </table>

      <p className="mt-6 text-xs text-hearth-ink/45 print:hidden">
        CSV uses the same filters:{" "}
        <code className="text-[11px]">{statementQuery(filters)}</code>
      </p>
    </Surface>
  );
}

function StatementMobileCard({
  index,
  row,
  currency,
  locale,
}: {
  index: number;
  row: StatementRow;
  currency: string;
  locale: Locale;
}) {
  void locale;
  return (
    <article className="rounded-xl border border-border/70 bg-[color-mix(in_srgb,var(--hearth-paper)_40%,white)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-hearth-ink/50">
            #{index} · {row.date} · {row.type}
          </p>
          <p className="mt-0.5 truncate font-medium text-hearth-ink">
            {row.title}
          </p>
          <p className="mt-0.5 text-xs text-hearth-ink/55">
            {row.category}
            {row.addedBy ? ` · ${row.addedBy}` : ""}
            {" · "}
            {row.recordedAt.slice(0, 16).replace("T", " ")}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 font-heading text-base tabular-money",
            row.sign > 0 ? "text-hearth-ember" : "text-hearth-ink",
          )}
        >
          {formatSignedAmount(row, currency)}
        </p>
      </div>
    </article>
  );
}

function MobileTotals({
  totals,
  currency,
  locale,
  tr,
}: {
  totals: StatementTotals;
  currency: string;
  locale: Locale;
  tr: (path: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="rounded-xl border border-hearth-moss/20 bg-[color-mix(in_srgb,var(--hearth-moss)_6%,var(--hearth-paper))] px-3 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-hearth-ink">
          {tr("statements.netInOut")}
        </span>
        <span className="font-heading tabular-money text-hearth-ink">
          {formatSignedAmount(
            {
              amount: Math.abs(totals.net),
              sign: totals.net >= 0 ? 1 : -1,
            },
            currency,
          )}
        </span>
      </div>
      {totals.pendingOutflow > 0 ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-hearth-ink/55">
          <span>{tr("statements.pendingBills")}</span>
          <span className="tabular-money">
            {formatCurrency(totals.pendingOutflow, currency, locale)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SummaryStrip({
  totals,
  currency,
  locale,
  tr,
}: {
  totals: StatementTotals;
  currency: string;
  locale: Locale;
  tr: (path: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCell
        label={tr("statements.in")}
        value={formatCurrency(totals.inflow, currency, locale)}
        tone="ember"
      />
      <SummaryCell
        label={tr("statements.out")}
        value={formatCurrency(totals.outflow, currency, locale)}
      />
      <SummaryCell
        label={tr("statements.net")}
        value={formatSignedAmount(
          {
            amount: Math.abs(totals.net),
            sign: totals.net >= 0 ? 1 : -1,
          },
          currency,
        )}
        tone="moss"
      />
      <SummaryCell
        label={tr("statements.rows")}
        value={String(totals.rowCount)}
      />
    </div>
  );
}

function SummaryCell({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "ember" | "moss";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        tone === "default" &&
          "border-border/60 bg-[color-mix(in_srgb,var(--hearth-paper)_45%,white)]",
        tone === "ember" &&
          "border-[color-mix(in_srgb,var(--hearth-ember)_28%,var(--border))] bg-[color-mix(in_srgb,var(--hearth-ember)_10%,white)]",
        tone === "moss" &&
          "border-hearth-moss/25 bg-[color-mix(in_srgb,var(--hearth-moss)_10%,white)]",
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-hearth-ink/45">
        {label}
      </p>
      <p className="truncate font-heading text-lg tabular-money text-hearth-ink">
        {value}
      </p>
    </div>
  );
}
