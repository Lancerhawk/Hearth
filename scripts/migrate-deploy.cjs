/**
 * Runs prisma migrate deploy.
 * Prefer DIRECT_URL (session pooler :5432) when present — safer for migrates
 * than a transaction-pooler DATABASE_URL (:6543).
 */
require("dotenv").config();

const { spawnSync } = require("node:child_process");

const env = { ...process.env };
if (env.DIRECT_URL) {
  // Prisma migrate uses DATABASE_URL; temporarily point it at the direct URL.
  env.DATABASE_URL = env.DIRECT_URL;
  console.log("[migrate-deploy] using DIRECT_URL for migrate deploy");
}

if (!env.DATABASE_URL) {
  console.error("[migrate-deploy] DATABASE_URL is required");
  process.exit(1);
}

const result = spawnSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
