export const creatorSelect = {
  select: { id: true, name: true, email: true },
} as const;

export const categorySelect = {
  select: { id: true, name: true, color: true },
} as const;

export const amountOnly = {
  select: { amount: true },
} as const;

export const billAmountStatus = {
  select: { amount: true, status: true },
} as const;
