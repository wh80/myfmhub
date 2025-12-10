import { z } from "zod";
import { dateFromString } from "../../utils/schemaUtils.js";

export const jobSchema = z.object({
  summary: z.string().trim().min(5, "Summary must be at least 5 characters"),
  description: z.string().trim().optional(),
  locationId: z.string(),
  categoryId: z.string().nullable().optional(),
  createdAt: dateFromString().optional(), // value may be provided in csv data on import
});

export const createJobSchema = jobSchema;

export const updateJobSchema = jobSchema.partial(); // All fields optional
