import type { WorkspaceKind } from "@/types/prisma";

/** Nav / page label for money-in entries: Home → Funds, You → Income */
export function moneyInLabel(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL" ? "Income" : "Funds";
}

export function moneyInDescription(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL"
    ? "Paychecks and other money in. Last month’s leftover is brought forward automatically."
    : "Household money in this month. Last month’s leftover is brought forward automatically.";
}

export function workspaceKindLabel(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL" ? "Just you" : "Home";
}
