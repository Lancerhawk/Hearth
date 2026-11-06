import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .default("INR"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
