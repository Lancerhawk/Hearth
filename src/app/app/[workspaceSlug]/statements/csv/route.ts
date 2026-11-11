import { requireMembership } from "@/lib/budget/access";
import { loadMonthBudget } from "@/lib/budget/load-month";
import { parsePeriod } from "@/lib/budget/period";
import { buildStatementRows, statementCsv } from "@/lib/statements/build-rows";

export async function GET(
  request: Request,
  context: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await context.params;
  const { workspace } = await requireMembership(workspaceSlug);
  const url = new URL(request.url);
  const { year, month } = parsePeriod(
    url.searchParams.get("year"),
    url.searchParams.get("month"),
  );
  const { budget } = await loadMonthBudget(workspace.id, year, month);
  const rows = buildStatementRows({
    expenses: budget.expenses,
    charges: budget.charges,
    incomes: budget.incomes,
    savings: budget.savings,
    bills: budget.billInstances,
  });
  const body = statementCsv(rows, workspace.currency);
  const filename = `hearth-${workspace.slug}-${year}-${String(month).padStart(2, "0")}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
