import { z } from "zod";

export const categorySchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters"),
});
