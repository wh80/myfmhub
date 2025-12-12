import prisma from "../../config/prisma.js";
import Papa from "papaparse";
import { findLocationByMaterialisedPath } from "../locations/locationUtils.js";
import { createAssetSchema } from "./schema.js";

export const validHeaders = [
  "description",
  "assetNumber",
  "locationLevelOne",
  "locationLevelTwo",
  "locationLevelThree",
  "locationLevelFour",
  "locationLevelFive",
  "make",
  "model",
  "serialNumber",
  "category",
];

export async function importAssetData(csvText, accountId) {
  let importCount = 0;
  let errorRows = [];
  let validRows = [];

  const existingAssets = await prisma.asset.findMany({
    where: { accountId },
    select: {
      description: true,
      id: true,
      assetNumber: true,
      serialNumber: true,
    },
  });

  const existingCategories = await prisma.assetCategory.findMany({
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

  console.log("Headers:", result.meta.fields);
  console.log("First row raw:", result.data[0]);

  // Clean row data
  const data = result.data;

  // Process each ros
  for (let i = 0; i < data.length; i++) {
    const rowNumber = i + 2; // +2 to account for CSV header
    const csvRow = data[i]; // row data

    // Extract values
    const description = csvRow["description"]?.trim() || undefined;
    const locLevelOne = csvRow["locationLevelOne"]?.trim() || undefined;
    const locLevelTwo = csvRow["locationLevelTwo"]?.trim() || undefined;
    const locLevelThree = csvRow["locationLevelThree"]?.trim() || undefined;
    const locLevelFour = csvRow["locationLevelFour"]?.trim() || undefined;
    const locLevelFive = csvRow["locationLevelFive"]?.trim() || undefined;
    const make = csvRow["make"]?.trim() || undefined;
    const model = csvRow["model"]?.trim() || undefined;
    const serialNumber = csvRow["serialNumber"]?.trim() || undefined;
    const assetNumber = csvRow["assetNumber"]?.trim() || undefined;
    const categoryDescription = csvRow["category"]?.trim() || undefined;

    const levels = [
      locLevelOne,
      locLevelTwo,
      locLevelThree,
      locLevelFour,
      locLevelFive,
    ];

    // Step 1: Validate Required Fields

    if (!description) {
      errorRows.push(
        `Row ${rowNumber}: A description must be provided for an asset.`
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

    // Step 3 - Duplicate checks
    let duplicate = false;
    if (assetNumber)
      duplicate = existingAssets.find(
        (asset) => asset.assetNumber?.toLowerCase() == assetNumber.toLowerCase()
      );

    if (duplicate) {
      errorRows.push(
        `Row ${rowNumber}: An asset with this asset number already exists.`
      );
      continue;
    }

    if (serialNumber)
      duplicate = existingAssets.find(
        (asset) =>
          asset.serialNumber?.toLowerCase() == serialNumber.toLowerCase()
      );

    if (duplicate) {
      errorRows.push(
        `Row ${rowNumber}: An asset with this serial number already exists.`
      );
      continue;
    }

    // Step 4 - Match Category
    let matchedCategory = null;
    if (categoryDescription) {
      matchedCategory = existingCategories.find(
        (cat) =>
          cat.description.toLowerCase() == categoryDescription.toLowerCase()
      );
      if (!matchedCategory) {
        errorRows.push(
          `Row ${rowNumber}: The category provided for this asset does not exist.`
        );
        continue;
      }
    }

    // Step 5 - Validate

    const validated = createAssetSchema.safeParse({
      description,
      locationId: matchedLocation.id,
      categoryId: matchedCategory?.id,
      make,
      model,
      serialNumber,
      assetNumber,
    });

    if (!validated.success) {
      const fieldErrors = Object.entries(validated.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");

      errorRows.push(`Row ${rowNumber}: Validation errors — ${fieldErrors}`);
      continue;
    }

    const newAsset = {
      description: validated.data.description,
      locationId: validated.data.locationId,
      make: validated.data.make,
      model: validated.data.model,
      serialNumber: validated.data.serialNumber,
      assetNumber: validated.data.assetNumber,
      categoryId: validated.categoryId || null,
      accountId,
    };

    existingAssets.push(newAsset);
    validRows.push(newAsset);
    importCount++;
  }

  if (validRows.length > 0) {
    await prisma.asset.createMany({
      data: validRows,
      skipDuplicates: true,
    });
  }

  return { importErrors: errorRows, importCount };
}
