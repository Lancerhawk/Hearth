/**
 * App-level Prisma enums as string unions.
 * Keeps IDE/tsc happy under pnpm without relying on fragile
 * `@prisma/client` enum re-exports for type-only imports.
 * Values must stay in sync with prisma/schema.prisma.
 */
export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";
export type WorkspaceKind = "HOME" | "PERSONAL";
export type CategoryType = "EXPENSE" | "CHARGE" | "SAVINGS" | "INCOME";
export type BillStatus = "PENDING" | "PAID" | "SKIPPED";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type NotificationType =
  | "BILL_DUE_SOON"
  | "BILL_OVERDUE"
  | "INVITE_RECEIVED"
  | "INVITE_ACCEPTED"
  | "MEMBER_JOINED"
  | "BUDGET_LOW"
  | "GENERIC";
