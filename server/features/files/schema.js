import { z } from "zod";

export const fileSchema = z.object({
  description: z.string().trim().min(1, "Please provide a description"),
  categoryId: z.string().optional(),
});

export const createFileSchema = fileSchema;

export const updateFileSchema = fileSchema.partial(); // All fields optional
