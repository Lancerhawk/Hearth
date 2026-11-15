/**
 * Runs prisma migrate deploy.
 * Prefer DIRECT_URL (session :5432). If missing and DATABASE_URL is the
 * transaction pooler (:6543), rewrite to session port so migrate does not hang.
 */
require("dotenv").config();

const { spawnSync } = require("node:child_process");

function toSessionUrl(url) {
  if (!url.includes(":6543")) return url;
  return url
    .replace(":6543", ":5432")
    .replace(/[?&]pgbouncer=true/g, "")
    .replace(/[?&]connection_limit=\d+/g, "")
    .replace(/\?&/, "?")
    .replace(/&&+/g, "&")
    .replace(/\?$/, "");
}

const env = { ...process.env };

if (env.DIRECT_URL) {
  env.DATABASE_URL = env.DIRECT_URL;
  console.log("[migrate-deploy] using DIRECT_URL for migrate deploy");
} else if (env.DATABASE_URL) {
  const session = toSessionUrl(env.DATABASE_URL);
  if (session !== env.DATABASE_URL) {
    env.DATABASE_URL = session;
    console.log(
      "[migrate-deploy] DIRECT_URL unset; rewritten DATABASE_URL :6543 → :5432 for migrate",
    );
  }
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
