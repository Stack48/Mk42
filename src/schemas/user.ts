import { z } from "zod";

export const UserInputSchema = z.object({
  email: z.string().email("Email invalide"),
  clerkId: z.string().min(1, "Le clerkId est requis"),
});
