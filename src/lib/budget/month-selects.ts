export const creatorSelect = {
  select: { id: true, name: true, email: true },
} as const;

export const categorySelect = {
  select: { id: true, name: true, color: true },
} as const;

export const amountOnly = {
  select: { amount: true },
} as const;

export const incomeAmountDate = {
  select: { amount: true, earnedOn: true },
} as const;

export const expenseAmountDate = {
  select: { amount: true, spentOn: true },
} as const;

export const chargeAmountDate = {
  select: { amount: true, chargedOn: true },
} as const;

export const savingsAmountDate = {
  select: { amount: true, savedOn: true },
} as const;

export const billAmountStatus = {
  select: { amount: true, status: true, dueDate: true },
} as const;
