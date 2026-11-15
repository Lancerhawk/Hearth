import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 10);

  const arin = await prisma.user.upsert({
    where: { email: "arin@hearth.local" },
    update: {},
    create: {
      email: "arin@hearth.local",
      name: "Arin",
      passwordHash,
    },
  });

  const sam = await prisma.user.upsert({
    where: { email: "sam@hearth.local" },
    update: {},
    create: {
      email: "sam@hearth.local",
      name: "Sam",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-home" },
    update: {},
    create: {
      name: "Demo Home",
      slug: "demo-home",
      currency: "INR",
      members: {
        create: [
          { userId: arin.id, role: "OWNER" },
          { userId: sam.id, role: "MEMBER" },
        ],
      },
      categories: {
        create: [
          { name: "Groceries", type: "EXPENSE", color: "#6b7c5a" },
          { name: "Transport", type: "EXPENSE", color: "#5a6b7c" },
          { name: "Utilities", type: "CHARGE", color: "#7c6b5a" },
        ],
      },
    },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const budget = await prisma.monthlyBudget.upsert({
    where: {
      workspaceId_year_month: {
        workspaceId: workspace.id,
        year,
        month,
      },
    },
    update: {},
    create: { workspaceId: workspace.id, year, month },
  });

  const groceries = await prisma.category.findFirst({
    where: { workspaceId: workspace.id, name: "Groceries" },
  });

  const incomeCount = await prisma.incomeEntry.count({
    where: { budgetId: budget.id },
  });
  if (incomeCount === 0) {
    await prisma.incomeEntry.create({
      data: {
        title: "Salary",
        amount: 80000,
        earnedOn: new Date(year, month - 1, 1, 12),
        budgetId: budget.id,
        createdById: arin.id,
      },
    });
    await prisma.expenseEntry.createMany({
      data: [
        {
          title: "Weekly groceries",
          amount: 2400,
          spentOn: new Date(year, month - 1, 3, 12),
          categoryId: groceries?.id,
          budgetId: budget.id,
          createdById: arin.id,
        },
        {
          title: "Fruit market",
          amount: 650,
          spentOn: new Date(year, month - 1, 5, 12),
          categoryId: groceries?.id,
          budgetId: budget.id,
          createdById: sam.id,
        },
      ],
    });
    await prisma.recurringBill.create({
      data: {
        name: "Internet",
        amount: 999,
        dayOfMonth: 8,
        workspaceId: workspace.id,
        instances: {
          create: {
            budgetId: budget.id,
            amount: 999,
            dueDate: new Date(Date.UTC(year, month - 1, 8, 12)),
            status: "PENDING",
          },
        },
      },
    });
  }

  console.log("Seeded demo household:");
  console.log("  arin@hearth.local / password123 (owner)");
  console.log("  sam@hearth.local / password123 (member)");
  console.log("  workspace: /app/demo-home/dashboard");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
