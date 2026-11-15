/**
 * Ensures DIRECT_URL exists for Prisma migrate (local + Vercel).
 * Prefer session/direct URL; fall back to DATABASE_URL if unset.
 */
require("dotenv").config();

const { spawnSync } = require("node:child_process");

const env = { ...process.env };
if (!env.DIRECT_URL && env.DATABASE_URL) {
  env.DIRECT_URL = env.DATABASE_URL;
  console.warn(
    "[migrate-deploy] DIRECT_URL missing; falling back to DATABASE_URL",
  );
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
