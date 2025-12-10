import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(1, "Please provide a password"),
});

export const passwordSchema = z.object({
  password: z.string().trim().min(1, "Please provide a password"),
});
