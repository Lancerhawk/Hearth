import { syncCarryoverFunds } from "@/lib/budget/carryover";
import { withPerfLog } from "@/lib/budget/perf-log";
import { ensureMonthlyBudget } from "@/lib/budget/period";

/** Ensure the month row exists and carryover is settled before reading lists. */
export async function prepareMonthBudget(
  workspaceId: string,
  year: number,
  month: number,
) {
  return withPerfLog(`prepareMonth ${year}-${month}`, async () => {
    const budget = await ensureMonthlyBudget(workspaceId, year, month);
    await syncCarryoverFunds(workspaceId, year, month);
    return budget;
  });
}
