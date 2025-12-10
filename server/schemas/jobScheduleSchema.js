import { z } from "zod";

export const jobScheduleSchema = z.object({
  summary: z.string(),
  description: z.string(),
  nextDue: z.string(),
  interval: z.string(),
  frequency: z.string(),
  noticeDays: z.string(),
  statutoryCompliance: z.boolean(),
  autoAssign: z.boolean(),
  categoryId: z.string().nullable().optional(),
  jobCategoryId: z.string().nullable().optional(),
  locationId: z.string(),
});
