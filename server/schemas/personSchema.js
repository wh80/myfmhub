import { z } from "zod";

export const personSchema = z.object({
  locationId: z.string(),
  firstName: z.string().trim().min(2, "First name be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name be at least 2 characters"),
  email: z.string().email().trim().nullable().optional(),
  landline: z.string().trim().nullable().optional(),
  jobTitle: z.string().trim().nullable().optional(),
  mobile: z.string().trim().nullable().optional(),
});
