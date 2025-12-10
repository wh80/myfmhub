import { z } from "zod";

export const locationAlertSchema = z.object({
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 3 characters"),
  locationId: z.string().nullable().optional(),
  locationAlertCategoryId: z.string(),
});
