import prisma from "../../config/prisma.js";
import Papa from "papaparse";
import { findLocationByMaterialisedPath } from "../locations/locationUtils.js";
import { createJobScheduleSchema } from "./schema.js";
import { calculateNextJobCreationDate } from "./jobScheduleUtils.js";

export const validHeaders = [
  "locationLevelOne",
  "locationLevelTwo",
  "locationLevelThree",
  "locationLevelFour",
  "locationLevelFive",
  "summary",
  "description",
  "nextDueDate",
  "statutoryCompliance",
  "recurranceInterval",
  "recurranceUnit",
  "noticeDays",
  "category",
  "jobCategory",
  "linkedAssetNumbers",
];

export async function importJobScheduleData(csvText, accountId) {
  let importCount = 0;
  let errorRows = [];
  let validRows = [];

  // not really needed unless start adding dupe checks
  const existingSchedules = await prisma.jobSchedule.findMany({
    where: { accountId },
    select: {
      id: true,
    },
  });

  // Load assets in preparation for linking
  const existingAssets = await prisma.asset.findMany({
    where: { accountId },
    select: {
      id: true,
      assetNumber: true,
    },
  });

  const existingCategories = await prisma.jobScheduleCategory.findMany({
    where: { accountId },
    select: { description: true, id: true },
  });

  const existingJobCategories = await prisma.jobCategory.findMany({
    where: { accountId },
    select: { description: true, id: true },
  });

  const existingLocations = await prisma.location.findMany({
    where: { accountId },
    select: { description: true, id: true, materialisedPath: true },
  });

  const result = Papa.parse(csvText, {
    header: true, // Convert to objects using headers
    skipEmptyLines: true, // Ignore blank lines
    transformHeader: (h) => h.trim(), // Clean headers
    dynamicTyping: false, // Convert numbers/booleans automatically
  });

  if (result.errors.length > 0) {
    return { errors: result.errors };
  }

  // Clean row data
  const data = result.data;

  // Process each ros
  for (let i = 0; i < data.length; i++) {
    const rowNumber = i + 2; // +2 to account for CSV header
    const csvRow = data[i]; // row data

    // Extract values

    const locLevelOne = csvRow["locationLevelOne"]?.trim() || undefined;
    const locLevelTwo = csvRow["locationLevelTwo"]?.trim() || undefined;
    const locLevelThree = csvRow["locationLevelThree"]?.trim() || undefined;
    const locLevelFour = csvRow["locationLevelFour"]?.trim() || undefined;
    const locLevelFive = csvRow["locationLevelFive"]?.trim() || undefined;
    const summary = csvRow["summary"]?.trim() || undefined;
    const description = csvRow["description"]?.trim() || undefined;
    const nextDueDate = csvRow["nextDueDate"]?.trim() || undefined;
    const statutoryCompliance =
      csvRow["statutoryCompliance"]?.trim() || undefined;
    const recurranceInterval =
      csvRow["recurranceInterval"]?.trim() || undefined;
    const recurranceUnit = csvRow["recurranceUnit"]?.trim() || undefined;
    const noticeDays = csvRow["noticeDays"]?.trim() || undefined;
    const category = csvRow["category"]?.trim() || undefined;
    const jobCategory = csvRow["jobCategory"]?.trim() || undefined;
    const linkedAssetNumbers = csvRow["linkedAssetNumbers"] || undefined;

    const levels = [
      locLevelOne,
      locLevelTwo,
      locLevelThree,
      locLevelFour,
      locLevelFive,
    ];

    // Step 1: Validate Required Fields

    if (!summary) {
      errorRows.push(
        `Row ${rowNumber}: A summary must be provided for an job schedule.`
      );
      continue;
    }

    // Step 2: Validate location data & get matched location

    // locationLevelOne is not required as can create against root location

    // Check for gaps
    let hasGap = false;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] && !levels[i - 1]) {
        errorRows.push(
          `Row ${rowNumber}: Cannot provide locationLevel${
            i + 1
          } without level${i}`
        );
        hasGap = true;
        break;
      }
    }
    if (hasGap) {
      errorRows.push(`Row ${rowNumber}: Gaps found in location hierarchy`);
      continue;
    }

    //  Identify levels provided & get target location based on matching materialised Path
    const providedLevels = levels.filter(Boolean);

    const matchedLocation = findLocationByMaterialisedPath(
      existingLocations,
      providedLevels
    );

    if (!matchedLocation) {
      errorRows.push(
        `Row ${rowNumber}: Could not match the location path provided for this location.`
      );
      continue;
    }

    // Step 3 - Match Category(s)
    let matchedCategoryId = null;
    if (category) {
      console.log("Category Provided - Trying to match");
      const matchedCategory = existingCategories.find(
        (cat) => cat.description.toLowerCase() == category.toLowerCase()
      );
      if (!matchedCategory) {
        errorRows.push(
          `Row ${rowNumber}: The category provided for this schedule does not exist.`
        );
        continue;
      }
      matchedCategoryId = matchedCategory.id;
      console.log("Matched Category!");
    }

    let matchedJobCategoryId = null;
    if (jobCategory) {
      const matchedCategory = existingJobCategories.find(
        (cat) => cat.description.toLowerCase() == jobCategory.toLowerCase()
      );
      if (!matchedCategory) {
        errorRows.push(
          `Row ${rowNumber}: The job category provided for this schedule does not exist.`
        );
        continue;
      }
      matchedJobCategoryId = matchedCategory.id;
    }

    // Step 4 - Validate

    const validated = createJobScheduleSchema.safeParse({
      locationId: matchedLocation.id,
      categoryId: matchedCategoryId,
      jobCategoryId: matchedJobCategoryId,
      summary,
      description,
      nextDueDate,
      statutoryCompliance,
      recurranceInterval,
      recurranceUnit,
      noticeDays,
    });

    if (!validated.success) {
      const fieldErrors = Object.entries(validated.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");

      errorRows.push(`Row ${rowNumber}: Validation errors — ${fieldErrors}`);
      continue;
    }

    // Step 5 - Handle linking any asset numbers
    let assetIdsToLink = [];

    if (linkedAssetNumbers) {
      // Check if it looks like it's using the wrong delimiter
      if (
        linkedAssetNumbers.includes("|") ||
        linkedAssetNumbers.includes(";") ||
        linkedAssetNumbers.includes("/")
      ) {
        errorRows.push(
          `Row ${rowNumber}: linkedAssetNumbers appears to use wrong delimiter (use commas)`
        );
        continue;
      }

      const assetNumbers = linkedAssetNumbers
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num !== "");

      // Find matching assets
      const matchedAssets = existingAssets.filter((asset) =>
        assetNumbers.includes(asset.assetNumber)
      );

      assetIdsToLink = matchedAssets.map((asset) => asset.id);

      // Check if all asset numbers were found
      const foundNumbers = matchedAssets.map((asset) => asset.assetNumber);
      const notFoundNumbers = assetNumbers.filter(
        (num) => !foundNumbers.includes(num)
      );

      if (notFoundNumbers.length > 0) {
        errorRows.push(
          `Row ${rowNumber}: Asset numbers not found: ${notFoundNumbers.join(
            ", "
          )}`
        );
        continue;
      }
    }

    // Step 6 - calculate next job creation date
    const nextJobCreationDate = await calculateNextJobCreationDate(
      validated.data.nextDueDate,
      validated.data.noticeDays,
      accountId
    );

    // Step 7 - Create new schedule and add to valid rows ready for bulk importing
    const newSchedule = {
      summary: validated.data.summary,
      description: validated.data.description,
      nextDueDate: validated.data.nextDueDate,
      statutoryCompliance: validated.data.statutoryCompliance,
      recurranceInterval: validated.data.recurranceInterval,
      recurranceUnit: validated.data.recurranceUnit,
      noticeDays: validated.data.noticeDays,
      locationId: validated.data.locationId,
      nextJobCreationDate,
      categoryId: validated.data.categoryId || null,
      jobCategoryId: validated.data.jobCategoryId || null,
      accountId,
      ...(assetIdsToLink.length > 0 && {
        assets: {
          connect: assetIdsToLink.map((id) => ({ id })),
        },
      }),
    };

    existingSchedules.push(newSchedule); // not really needed unless start adding dupe checks
    validRows.push(newSchedule);
    importCount++;
  }

  // Step 8 - Import all valid rows
  // Can't use bulk create as using connect

  if (validRows.length > 0) {
    await prisma.$transaction(
      validRows.map((data) => prisma.jobSchedule.create({ data }))
    );
  }

  return { importErrors: errorRows, importCount };
}
