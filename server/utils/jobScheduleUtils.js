import prisma from "../config/prisma.js";
import {
  subDays,
  isWeekend,
  subBusinessDays,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns";

// Calculate next job creation date for job schedules
export async function calculateNextJobCreationDate(
  nextDueDate,
  noticeDays,
  accountId
) {
  const settings = await prisma.accountSetting.findUnique({
    where: { accountId },
  });

  if (settings?.ignoreWeekendDays) {
    // Subtract business days (Mon-Fri only)
    return subBusinessDays(nextDueDate, noticeDays);
  }

  // Standard calendar days
  return subDays(nextDueDate, noticeDays);
}

// Helper to calculate next due date based on recurrence
export function calculateNextDueDate(currentDueDate, interval, unit) {
  switch (unit) {
    case "days":
      return addDays(currentDueDate, interval);
    case "weeks":
      return addWeeks(currentDueDate, interval);
    case "months":
      return addMonths(currentDueDate, interval);
    case "years":
      return addYears(currentDueDate, interval);
    default:
      throw new Error(`Unknown recurrence unit: ${unit}`);
  }
}
