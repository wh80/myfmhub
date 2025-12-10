import { z } from "zod";

// Schema for general asset fields
export const assetSchema = z.object({
  locationId: z.string().nullable().optional(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  categoryId: z.string().nullable().optional(),
  conditionId: z.string().nullable().optional(),
  assetNumber: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
});

// Schema for advanced asset fields
export const advancedAssetSchema = z.object({
  purchaseDate: z.string().nullable().optional(),
  purchasedFrom: z.string().nullable().optional(),
  warrantyExpiry: z.string().nullable().optional(),
  poNumber: z.string().nullable().optional(),
  estReplacementDate: z.string().nullable().optional(),
});
