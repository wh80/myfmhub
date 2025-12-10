import { z } from "zod";

export const noteSchema = z.object({
  body: z.string().trim(),
  jobId: z.string().trim().nullable().optional(),
});
