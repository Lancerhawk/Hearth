import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
