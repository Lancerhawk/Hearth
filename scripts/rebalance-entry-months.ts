/**
 * One-shot: move money rows onto the MonthlyBudget that matches their date.
 * Keep this off the interactive page path.
 *
 * Run once after upgrading past the hot-path rebalance removal (local + each
 * deployed database):
 *
 *   pnpm db:rebalance-months
 */
import "dotenv/config";
import { rebalanceAllWorkspaces } from "../src/lib/budget/rebalance-all";

async function main() {
  const result = await rebalanceAllWorkspaces();
  console.log(
    `Rebalanced entry months for ${result.workspaceCount} workspace(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
