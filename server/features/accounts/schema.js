import { z } from "zod";

export const createAccountSchema = z.object({
  organisation: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
  firstName: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
  lastName: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
  email: z.string().email("Invalid email").trim().min(3).max(255),
  password: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
});

export const updateAccountSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),
});
