import { z } from "zod";

export const locationSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(50, "Max 50 characters"),
  parentId: z.string().min(1, "Parent location is required"),
  categoryId: z.string().optional(),
  address: z.string().trim().max(500).optional(),
  telephone: z.string().trim().max(50).optional(),
});

export const createLocationSchema = locationSchema;

export const updateLocationSchema = locationSchema
  .omit({ parentId: true }) // Can't change parent
  .partial(); // All fields optional
