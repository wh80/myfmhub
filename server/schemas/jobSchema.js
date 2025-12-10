import { z } from "zod";

export const jobSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  description: z.string().trim(),
  locationId: z.string().nullable().optional(),

  assetId: z.string().nullable().optional(), //Provided if creating job from an asset
  categoryId: z.string().nullable().optional(),
});

export const assignmentSchema = z.object({
  workInstructions: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  assignmentType: z.string(),
  personId: z.string().nullable().optional(),
  contractorId: z.string().nullable().optional(),
  jobIds: z
    .array(z.string())
    .optional()
    .nullable()
    .refine((val) => val == null || val.length > 0, {
      message: "At least one job must be selected",
    }),
  completionTarget: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date and time",
  }),
});
