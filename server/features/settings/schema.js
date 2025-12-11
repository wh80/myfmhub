import { z } from "zod";

export const dataCategorySchema = z.object({
  description: z.string().trim(),
});

export const createJobSchema = dataCategorySchema;

export const updateJobSchema = dataCategorySchema;
