import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Invalid email").trim().min(3).max(255),
  password: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
});

export const loginSchema = authSchema;
