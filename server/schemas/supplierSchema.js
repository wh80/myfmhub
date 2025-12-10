import { z } from "zod";

export const supplierSchema = z.object({
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  categoryId: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  telephone: z.string().trim().nullable().optional(),
  website: z.string().trim().nullable().optional(),
});
