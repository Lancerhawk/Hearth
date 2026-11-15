import type { WorkspaceKind } from "@/types/prisma";

/** Nav / page label for money-in entries: Home → Funds, You → Income */
export function moneyInLabel(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL" ? "Income" : "Funds";
}

export function moneyInDescription(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL"
    ? "Paychecks and other money in for this month."
    : "Household money available this month — salary, leftovers, one-offs.";
}

export function workspaceKindLabel(kind: WorkspaceKind = "HOME") {
  return kind === "PERSONAL" ? "Just you" : "Home";
}
