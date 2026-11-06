/**
 * pnpm keeps the generated client under the virtual store.
 * Symlink it to node_modules/.prisma so TypeScript / the IDE
 * can resolve `@prisma/client` re-exports reliably.
 */
const fs = require("fs");
const path = require("path");

function main() {
  let clientPkg;
  try {
    clientPkg = path.dirname(require.resolve("@prisma/client/package.json"));
  } catch {
    console.warn("[link-prisma] @prisma/client not installed yet");
    return;
  }

  // @prisma/client -> ../.prisma/client (sibling of @prisma under node_modules)
  const generated = path.resolve(clientPkg, "..", "..", ".prisma", "client");
  if (!fs.existsSync(generated)) {
    console.warn("[link-prisma] generated client missing at", generated);
    return;
  }

  const targetDir = path.resolve(process.cwd(), "node_modules", ".prisma");
  const linkPath = path.join(targetDir, "client");

  fs.mkdirSync(targetDir, { recursive: true });

  try {
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {
    // link may not exist
  }

  fs.symlinkSync(generated, linkPath, "dir");
  console.log("[link-prisma] linked", linkPath, "->", generated);
}

main();
