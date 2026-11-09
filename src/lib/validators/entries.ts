import { z } from "zod";

export const moneyEntrySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
});

export const recurringBillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  amount: z.coerce.number().positive(),
  dayOfMonth: z.coerce.number().int().min(1).max(28),
});
