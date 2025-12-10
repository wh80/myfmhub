import { z } from "zod";
import { parse, isValid } from "date-fns";
import { enGB } from "date-fns/locale"; // UK date formats

// Func to validate a range of date formats as valid date
// Used for csv imports where date format could vary based on user provided field format
export const dateFromString = () =>
  z.string().transform((val) => {
    const cleaned = val.trim();

    const formats = [
      "dd/MM/yy",
      "dd/MM/yyyy",
      "dd-MM-yy",
      "dd-MM-yyyy",
      "dd.MM.yy",
      "dd.MM.yyyy",
      "yyyy-MM-dd",
      "dd MMM yyyy",
      "dd MMMM yyyy",
      "do MMMM yyyy",
      "do MMM yyyy",
      "d MMMM yyyy",
      "MMMM do, yyyy",
    ];

    const referenceDate = new Date();

    for (const format of formats) {
      try {
        const parsed = parse(cleaned, format, referenceDate, { locale: enGB });
        if (isValid(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Continue to next format
      }
    }

    const fallback = new Date(cleaned);
    if (isValid(fallback)) {
      return fallback;
    }

    throw new Error(`Unable to parse date: "${val}"`);
  });

export const booleanFromString = () =>
  z.union([z.boolean(), z.string(), z.undefined()]).transform((val) => {
    if (typeof val === "boolean") return val;
    if (val === undefined) return false; // Unchecked checkbox
    const normalized = val.toLowerCase().trim();
    return ["yes", "y", "true", "1", "on"].includes(normalized);
  });
