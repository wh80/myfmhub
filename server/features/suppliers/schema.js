import { z } from "zod";

export const supplierSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Min 3 characters")
    .max(255, "Max 255 characters"),

  //skills: z.string().optional(),
  address: z.string().trim().min(5).max(150).or(z.literal("")).optional(),
  email: z.string().email().trim(),
  telephone: z
    .string()
    .trim()
    .refine((val) => val === "" || /^[+\d\s\-().]{10,30}$/.test(val), {
      message: "Invalid telephone number format",
    })
    .refine(
      (val) => {
        if (val === "") return true;
        const digitCount = (val.match(/\d/g) || []).length;
        return digitCount >= 10 && digitCount <= 15;
      },
      { message: "Telephone must contain 10-15 digits" }
    )
    .or(z.literal(""))
    .optional(),
});

export const createSupplierSchema = supplierSchema;

export const updateSupplierSchema = supplierSchema.partial(); // All fields optional
