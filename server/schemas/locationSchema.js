import { z } from "zod";

export const createLocationSchema = z.object({
  parentLocationId: z.string(),
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters"),

  categoryId: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  telephone: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine((val) => val === null || val === undefined || val.length >= 5, {
        message: "Telephone must be at least 5 characters if provided",
      })
  ),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .email()
      .nullable()
      .optional()
      .refine((val) => val === null || val === undefined || val.length >= 5, {
        message: "Email address must be at least 5 characters if provided",
      })
  ),
});

export const updateLocationSchema = z.object({
  // Parent ID not required on update
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters"),

  categoryId: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  telephone: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine((val) => val === null || val === undefined || val.length >= 5, {
        message: "Telephone must be at least 5 characters if provided",
      })
  ),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .email()
      .nullable()
      .optional()
      .refine((val) => val === null || val === undefined || val.length >= 5, {
        message: "Email address must be at least 5 characters if provided",
      })
  ),
});
