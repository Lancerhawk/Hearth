import { requireMembership } from "@/lib/budget/access";
import { statementCsv } from "@/lib/statements/build-rows";
import {
  parseStatementFilters,
  statementKindLabel,
  statementQuery,
} from "@/lib/statements/filters";
import { loadFilteredStatement } from "@/lib/statements/load-statement";
import { moneyInLabel } from "@/lib/workspace/labels";

export async function GET(
  request: Request,
  context: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await context.params;
  const { workspace } = await requireMembership(workspaceSlug);
  const url = new URL(request.url);
  const filters = parseStatementFilters(
    Object.fromEntries(url.searchParams.entries()),
  );
  const { rows, totals } = await loadFilteredStatement(workspace.id, filters);
  const body = statementCsv(rows, workspace.currency, totals);
  const kind = statementKindLabel(filters.kind, moneyInLabel(workspace.kind))
    .toLowerCase()
    .replaceAll(" ", "-");
  const filename = `hearth-${workspace.slug}-${kind}-${filters.from}_to_${filters.to}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Statement-Query": statementQuery(filters),
    },
  });
}
