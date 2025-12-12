import prisma from "../../config/prisma.js";
import Papa from "papaparse";
import { findLocationByMaterialisedPath } from "../locations/locationUtils.js";
import { createJobSchema } from "./schema.js";

export const validHeaders = [
  "locationLevelOne",
  "locationLevelTwo",
  "locationLevelThree",
  "locationLevelFour",
  "locationLevelFive",
  "summary",
  "description",
  "dueBy",
  "statutoryCompliance",
  "createdAt",
  "category",
];

export async function importJobData(csvText, accountId) {
  let importCount = 0;
  let errorRows = [];
  let validRows = [];

  // not really needed unless start adding dupe checks
  const existingJobs = await prisma.job.findMany({
    where: { accountId },
    select: {
      id: true,
    },
  });

  const existingCategories = await prisma.jobCategory.findMany({
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
    const dueBy = csvRow["dueBy"]?.trim() || undefined;
    const statutoryCompliance =
      csvRow["statutoryCompliance"]?.trim() || undefined;
    const createdAt = csvRow["createdAt"]?.trim() || undefined;

    const category = csvRow["category"]?.trim() || undefined;

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
        `Row ${rowNumber}: A summary must be provided for an job.`
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
        `Row ${rowNumber}: Could not match the location path provided for this asset.`
      );
      continue;
    }

    // Step 3 - Match Category(s)
    let matchedCategoryId = null;
    if (category) {
      const matchedCategory = existingCategories.find(
        (cat) => cat.description.toLowerCase() == category.toLowerCase()
      );
      if (!matchedCategory) {
        errorRows.push(
          `Row ${rowNumber}: The category provided for this job does not exist.`
        );
        continue;
      }
      matchedCategoryId = matchedCategory.id;
    }

    // Step 4 - Validate

    const validated = createJobSchema.safeParse({
      locationId: matchedLocation.id,
      categoryId: matchedCategoryId,
      summary,
      description,
      dueBy,
      statutoryCompliance,
    });

    if (!validated.success) {
      const fieldErrors = Object.entries(validated.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");

      errorRows.push(`Row ${rowNumber}: Validation errors — ${fieldErrors}`);
      continue;
    }

    const newJob = {
      summary: validated.data.summary,
      description: validated.data.description,
      dueBy: validated.data.dueBy,
      locationId: validated.data.locationId,
      categoryId: validated.data.categoryId || null,
      accountId,
      status: "New", // ???? Specify in CSV data?
    };

    existingJobs.push(newJob); // not really needed unless start adding dupe checks
    validRows.push(newJob);
    importCount++;
  }

  if (validRows.length > 0) {
    await prisma.job.createMany({
      data: validRows,
      skipDuplicates: true,
    });
  }

  return { importErrors: errorRows, importCount };
}
