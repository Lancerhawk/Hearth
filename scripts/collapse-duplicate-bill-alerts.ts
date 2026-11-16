/**
 * One-shot: for legacy bill alerts without sourceKey, keep the newest row
 * per user+type+title and mark older duplicates read.
 *
 *   pnpm exec tsx scripts/collapse-duplicate-bill-alerts.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.notification.findMany({
    where: {
      type: { in: ["BILL_DUE_SOON", "BILL_OVERDUE"] },
      sourceKey: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      readAt: true,
      createdAt: true,
    },
  });

  const seen = new Set<string>();
  const markReadIds: string[] = [];

  for (const row of rows) {
    const key = `${row.userId}|${row.type}|${row.title}`;
    if (seen.has(key)) {
      if (!row.readAt) markReadIds.push(row.id);
      continue;
    }
    seen.add(key);
  }

  if (markReadIds.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: markReadIds } },
      data: { readAt: new Date() },
    });
  }

  console.log(
    `Collapsed legacy bill alerts: kept ${seen.size} newest, marked ${markReadIds.length} older unread as read.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
