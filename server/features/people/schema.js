import { z } from "zod";

export const personSchema = z.object({
  locationId: z.string(),
  firstName: z.string().trim().min(2, "First name be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name be at least 2 characters"),
  email: z.string().email().trim(),
  jobTitle: z.string().trim().nullable().optional(),
  mobile: z.string().trim().nullable().optional(),
  // permissionGroupId: z.string(),
});

export const createPersonSchema = personSchema;

export const updatePersonSchema = personSchema.partial(); // All fields optional
