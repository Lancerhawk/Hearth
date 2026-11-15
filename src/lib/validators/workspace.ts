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
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code like INR or USD")
    .default("INR"),
  kind: z.enum(["HOME", "PERSONAL"]).default("HOME"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
