import { z } from "zod";

// Used for registering new accounts - needs info to create User / Person as well as Account
export const createAccountSchema = z.object({
  description: z
    .string()
    .trim()
    .min(5, "Organisation description must be at least 5 characters"),

  email: z.string().trim().email(),
  password: z.string().trim().min(1, "Please provide a password"),
  firstName: z.string().trim().min(2, "First name be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name be at least 2 characters"),
});

export const accountSchema = z.object({
  description: z
    .string()
    .trim()
    .min(5, "Organisation description must be at least 5 characters"),
});
