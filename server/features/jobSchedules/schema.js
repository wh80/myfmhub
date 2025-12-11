import { z } from "zod";

import { booleanFromString, dateFromString } from "../../utils/schemaUtils.js";

export const jobScheduleSchema = z.object({
  summary: z.string().trim().min(5, "Summary must be at least 5 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  nextDue: dateFromString(),
  statutoryCompliance: booleanFromString().default(false),
  recurrenceInterval: z.coerce // Fixed spelling
    .number()
    .int()
    .positive("Must be a positive number"),
  recurrenceUnit: z.enum(["days", "weeks", "months", "years"], {
    // Fixed spelling
    errorMap: () => ({ message: "Must be days, weeks, months, or years" }),
  }),
  noticeDays: z.coerce.number().int().min(0, "Notice days cannot be negative"),
  locationId: z.string().uuid("Invalid location selected"),
  categoryId: z.string().nullable().optional(),
  jobCategoryId: z.string().nullable().optional(),
});

export const createJobScheduleSchema = jobScheduleSchema;

export const updateJobScheduleSchema = jobScheduleSchema.partial().required({
  summary: true,
  nextDue: true,
  noticeDays: true,
  recurrenceInterval: true,
  recurrenceUnit: true,
});
