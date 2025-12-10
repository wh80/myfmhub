import { z } from "zod";

export const fileSchema = z.object({
  description: z.string().trim().min(1, "Please provide a description"),
});
