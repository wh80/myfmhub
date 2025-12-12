import prisma from "../../config/prisma.js";
import Papa from "papaparse";
import { createLocationSchema } from "./schema.js";
import { findLocationByMaterialisedPath } from "./locationUtils.js";

export const validHeaders = [
  "locationLevelOne",
  "locationLevelTwo",
  "locationLevelThree",
  "locationLevelFour",
  "locationLevelFive",
  "category",
  "address",
  "telephone",
  "email",
];

export async function importLocationData(csvText, accountId) {
  let importCount = 0;
  const errorRows = [];

  const existingLocations = await prisma.location.findMany({
    where: { accountId },
    select: {
      description: true,
      id: true,
      materialisedPath: true,
      parentId: true,
    },
  });

  const existingCategories = await prisma.locationCategory.findMany({
    where: { accountId },
    select: { description: true, id: true },
  });

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    dynamicTyping: true,
  });

  if (result.errors.length > 0) {
    // Filter out harmless delimiter warnings
    const realErrors = result.errors.filter(
      (e) => e.code !== "UndetectableDelimiter"
    );

    if (realErrors.length > 0) {
      console.error("PapaParse reported errors:", realErrors);
      return { errors: realErrors };
    }
  }

  const data = result.data;

  for (let i = 0; i < data.length; i++) {
    const rowNumber = i + 2;
    const csvRow = data[i];

    const locLevelOne = csvRow["locationLevelOne"]?.trim() || undefined;
    const locLevelTwo = csvRow["locationLevelTwo"]?.trim() || undefined;
    const locLevelThree = csvRow["locationLevelThree"]?.trim() || undefined;
    const locLevelFour = csvRow["locationLevelFour"]?.trim() || undefined;
    const locLevelFive = csvRow["locationLevelFive"]?.trim() || undefined;
    const address = csvRow["address"]?.trim() || undefined;
    const telephone = csvRow["telephone"]?.trim() || undefined;
    const email = csvRow["email"]?.trim() || undefined;
    const category = csvRow["category"]?.trim() || undefined;

    const levels = [
      locLevelOne,
      locLevelTwo,
      locLevelThree,
      locLevelFour,
      locLevelFive,
    ];

    // Step 1: Ensure level 1 value provided and no gaps in hierarchy
    if (!levels[0]) {
      errorRows.push(`Row ${rowNumber}: locationLevelOne is required`);
      continue;
    }

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

    // Step 2: Identify levels provided & description of level to be created (lowest one provided)
    const providedLevels = levels.filter(Boolean);
    const targetDescription = providedLevels.at(-1);

    // Step 3: Find parent location
    // Provided levels minus last one should then match parent's materialised path
    const parentLevels = providedLevels.slice(0, -1);

    const parentLocation = findLocationByMaterialisedPath(
      existingLocations,
      parentLevels
    );

    if (!parentLocation) {
      const errorMsg =
        parentLevels.length === 0
          ? `Row ${rowNumber}: Could not find root location for account.`
          : `Row ${rowNumber}: Could not match the location path / find the parent for this location.`;
      errorRows.push(errorMsg);
      continue;
    }

    // Step 4: Check not a duplicate on parent

    const duplicate = existingLocations.find(
      (loc) =>
        loc.description.toLowerCase() === targetDescription.toLowerCase() &&
        loc.parentId === parentLocation.id
    );

    if (duplicate) {
      errorRows.push(
        `Row ${rowNumber}: A child location with this description already exists on the target location. `
      );
      continue;
    }

    // Step 5: Match Category
    let categoryId = undefined;
    if (category) {
      const matchedCategory = existingCategories.find(
        (cat) => cat.description.toLowerCase() === category.toLowerCase()
      );

      if (matchedCategory) {
        categoryId = matchedCategory.id;
      } else {
        errorRows.push(
          `Row ${rowNumber}: The category description provided could not be matched.`
        );
        continue;
      }
    }

    // Validate

    const validated = createLocationSchema.safeParse({
      description: targetDescription,
      parentId: parentLocation.id,
      categoryId,
      address,
      telephone,
      email,
    });

    if (!validated.success) {
      const fieldErrors = Object.entries(validated.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");

      errorRows.push(`Row ${rowNumber}: Validation errors — ${fieldErrors}`);
      continue;
    }

    // Format address to match textarea input
    let formattedAddress;
    if (address) {
      formattedAddress = validated.data.address
        .split(",")
        .map((line) => line.trim())
        .join("\n");
    }

    const [newLocation] = await prisma.$transaction(async (tx) => {
      // Step 1: Create
      const created = await tx.location.create({
        data: {
          description: validated.data.description,
          address: formattedAddress,
          telephone: validated.data.telephone,
          email: validated.data.email,
          category: validated.data.categoryId
            ? { connect: { id: validated.data.categoryId } }
            : undefined,
          parent: { connect: { id: validated.data.parentId } },
          account: { connect: { id: accountId } },
          materialisedPath: [],
        },
        include: { parent: true },
      });

      // Step 2: Update with materialised path
      const updated = await tx.location.update({
        where: { id: created.id },
        data: {
          materialisedPath: [
            ...created.parent.materialisedPath,
            { id: created.id, description: created.description },
          ],
        },
      });

      return [updated];
    });

    existingLocations.push(newLocation);
    importCount++;
  }
  return {
    importCount,
    importErrors: errorRows,
  };
}
