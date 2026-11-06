import type { CategoryType } from "@/types/prisma";

const defaults: Array<{ name: string; type: CategoryType; color: string }> = [
  { name: "Groceries", type: "EXPENSE", color: "#5B8A72" },
  { name: "Dining", type: "EXPENSE", color: "#C47B4A" },
  { name: "Transport", type: "EXPENSE", color: "#4A6FA5" },
  { name: "Utilities", type: "EXPENSE", color: "#6B5B95" },
  { name: "Healthcare", type: "EXPENSE", color: "#B85C5C" },
  { name: "Entertainment", type: "EXPENSE", color: "#D4A017" },
  { name: "Other", type: "EXPENSE", color: "#7A7A7A" },
  { name: "Fees", type: "CHARGE", color: "#8B6F47" },
  { name: "Misc charge", type: "CHARGE", color: "#6E7F80" },
  { name: "Salary", type: "INCOME", color: "#3D7A5A" },
  { name: "Other income", type: "INCOME", color: "#4F7C6B" },
  { name: "Emergency fund", type: "SAVINGS", color: "#3F6F8A" },
  { name: "Investments", type: "SAVINGS", color: "#2F5D50" },
];

export function defaultCategoryCreates(workspaceId: string) {
  return defaults.map((item) => ({
    ...item,
    workspaceId,
  }));
}
