import { z } from "zod";

export const assetSchema = z.object({
  locationId: z.string(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(255),
  categoryId: z.string().optional(),
  assetNumber: z.string().nullable().optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
});

export const createAssetSchema = assetSchema;

export const updateAssetSchema = assetSchema.partial(); // All fields optional
