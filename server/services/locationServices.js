import prisma from "../config/dbConnection.js";
import { createImportEvent } from "../utils/generalUtils.js";

// Used to import location data from CSV files
export async function importLocationDataService(data, accountId, userId) {
  let importCount = 0;
  let rowErrors = [];

  try {
    // Create import event
    const importId = await createImportEvent(
      "Location Import",
      accountId,
      userId
    );

    // Load existing locations for this account
    let existingLocations = await prisma.location.findMany({
      where: { accountId },
    });

    // Load existing location categories for this account
    let existingCategories = await prisma.locationCategory.findMany({
      where: { accountId },
    });

    // Get the root location for this account (level 0)
    const rootLocation = existingLocations.find((loc) => loc.level === 0);
    if (!rootLocation) {
      throw new Error("Root location not found for account");
    }

    // Loop through each CSV row
    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2; // +2 to account for CSV header
      const csvRow = data[i];

      // Step 1. Extract all CSV data
      const locationLevelOne = csvRow["locationLevelOne"]?.trim();
      const locationLevelTwo = csvRow["locationLevelTwo"]?.trim();
      const locationLevelThree = csvRow["locationLevelThree"]?.trim();
      const locationLevelFour = csvRow["locationLevelFour"]?.trim();
      const locationLevelFive = csvRow["locationLevelFive"]?.trim();

      const address = csvRow["address"]?.trim();
      const category = csvRow["category"]?.trim();
      const telephone = csvRow["telephone"]?.trim();
      const email = csvRow["email"]?.trim();

      // Step 2 - Basic Validation

      // Check at least levelOne location provided
      if (!locationLevelOne) {
        rowErrors.push(
          `Row ${rowNumber}: A location must have at least a level one property to be created.`
        );
        continue;
      }

      // Step 3 - Formatting
      // Format address if provided into single field formatted as if created by textarea input
      // Swap commas for /n
      let formattedAddress;
      if (address) {
        formattedAddress = address
          .split(",")
          .map((line) => line.trim())
          .join("\n");
      }

      // Step 4 - Handle Category - create if doesn't exist
      let categoryId;
      if (category) {
        const existingCategory = existingCategories.find(
          (cat) => cat.description.toLowerCase() === category.toLowerCase()
        );

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const newCategory = await prisma.locationCategory.create({
            data: {
              description: category,
              account: {
                connect: {
                  id: accountId,
                },
              },
            },
          });

          existingCategories.push(newCategory);
          categoryId = newCategory.id;
        }
      }

      // Step 5 - Validate Email Format
      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex =
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/;
        const validEmail = emailRegex.test(normalizedEmail);
        if (!validEmail) {
          rowErrors.push(
            `Row ${rowNumber}: The email provided is not valid: ${email}.`
          );
          continue;
        }
      }

      // Process Locatoins
      let currentParentId = rootLocation.id;
      let lowestLocationId = null; // Used to track lowest level of location created - then any additional data attached to this.
      let isNew = false; // Used to make sure the object update only runs when creating a new location - avoids updating existing

      // Level 1 definately exists so can check and create
      const matchedLocation = existingLocations.find(
        (loc) =>
          loc.description.toLowerCase() === locationLevelOne.toLowerCase() &&
          loc.level === 1 &&
          loc.parentLocationId === currentParentId
      );

      if (matchedLocation) {
        isNew = false;
        currentParentId = matchedLocation.id;
        lowestLocationId = matchedLocation.id;
      } else {
        isNew = true;
        const newLocation = await prisma.location.create({
          data: {
            description: locationLevelOne,
            level: 1,
            materialisedPath: [],
            account: { connect: { id: accountId } },
            parentLocation: { connect: { id: currentParentId } },
            importEvent: { connect: { id: importId } },
          },
        });
        const { materialisedPath, level } = await getMaterialisedPathAndLevel(
          currentParentId,
          newLocation.id,
          newLocation.description
        );

        await prisma.location.update({
          where: { id: newLocation.id },
          data: { materialisedPath, level },
        });

        currentParentId = newLocation.id;
        lowestLocationId = newLocation.id;
        existingLocations.push(newLocation);
      }

      // Process Level Two
      if (locationLevelTwo) {
        const matchedLocation = existingLocations.find(
          (loc) =>
            loc.description.toLowerCase() === locationLevelTwo.toLowerCase() &&
            loc.level === 2 &&
            loc.parentLocationId === currentParentId
        );

        if (matchedLocation) {
          isNew = false;
          currentParentId = matchedLocation.id;
          lowestLocationId = matchedLocation.id;
        } else {
          isNew = true;
          const newLocation = await prisma.location.create({
            data: {
              description: locationLevelTwo,

              level: 2,
              materialisedPath: [],
              account: { connect: { id: accountId } },
              parentLocation: { connect: { id: currentParentId } },
              importEvent: { connect: { id: importId } },
            },
          });
          const { materialisedPath, level } = await getMaterialisedPathAndLevel(
            currentParentId,
            newLocation.id,
            newLocation.description
          );

          await prisma.location.update({
            where: { id: newLocation.id },
            data: { materialisedPath, level },
          });

          currentParentId = newLocation.id;
          lowestLocationId = newLocation.id;
          existingLocations.push(newLocation);
        }
      }

      // Process Level Three
      if (locationLevelThree) {
        const matchedLocation = existingLocations.find(
          (loc) =>
            loc.description.toLowerCase() ===
              locationLevelThree.toLowerCase() &&
            loc.level === 3 &&
            loc.parentLocationId === currentParentId
        );

        if (matchedLocation) {
          isNew = false;
          currentParentId = matchedLocation.id;
          lowestLocationId = matchedLocation.id;
        } else {
          isNew = true;
          const newLocation = await prisma.location.create({
            data: {
              description: locationLevelThree,
              level: 3,
              materialisedPath: [],
              account: { connect: { id: accountId } },
              parentLocation: { connect: { id: currentParentId } },
              importEvent: { connect: { id: importId } },
            },
          });

          const { materialisedPath, level } = await getMaterialisedPathAndLevel(
            currentParentId,
            newLocation.id,
            newLocation.description
          );

          await prisma.location.update({
            where: { id: newLocation.id },
            data: { materialisedPath, level },
          });
          currentParentId = newLocation.id;
          lowestLocationId = newLocation.id;
          existingLocations.push(newLocation);
        }
      }

      // Process Level Four
      if (locationLevelFour) {
        const matchedLocation = existingLocations.find(
          (loc) =>
            loc.description.toLowerCase() === locationLevelFour.toLowerCase() &&
            loc.level === 4 &&
            loc.parentLocationId === currentParentId
        );

        if (matchedLocation) {
          isNew = false;
          currentParentId = matchedLocation.id;
          lowestLocationId = matchedLocation.id;
        } else {
          isNew = true;
          const newLocation = await prisma.location.create({
            data: {
              description: locationLevelFour,
              level: 4,
              materialisedPath: [],
              account: { connect: { id: accountId } },
              parentLocation: { connect: { id: currentParentId } },
              importEvent: { connect: { id: importId } },
            },
          });
          const { materialisedPath, level } = await getMaterialisedPathAndLevel(
            currentParentId,
            newLocation.id,
            newLocation.description
          );

          await prisma.location.update({
            where: { id: newLocation.id },
            data: { materialisedPath, level },
          });
          currentParentId = newLocation.id;
          lowestLocationId = newLocation.id;
          existingLocations.push(newLocation);
        }
      }

      // Process Level Five
      if (locationLevelFive) {
        const matchedLocation = existingLocations.find(
          (loc) =>
            loc.description.toLowerCase() === locationLevelFive.toLowerCase() &&
            loc.level === 5 &&
            loc.parentLocationId === currentParentId
        );

        if (matchedLocation) {
          isNew = false;
          currentParentId = matchedLocation.id;
          lowestLocationId = matchedLocation.id;
        } else {
          isNew = true;
          const newLocation = await prisma.location.create({
            data: {
              description: locationLevelFive,
              level: 5,
              materialisedPath: [],
              account: { connect: { id: accountId } },
              parentLocation: { connect: { id: currentParentId } },
              importEvent: { connect: { id: importId } },
            },
          });

          const { materialisedPath, level } = await getMaterialisedPathAndLevel(
            currentParentId,
            newLocation.id,
            newLocation.description
          );

          await prisma.location.update({
            where: { id: newLocation.id },
            data: { materialisedPath, level },
          });

          currentParentId = newLocation.id;
          lowestLocationId = newLocation.id;
          existingLocations.push(newLocation);
        }
      }

      // 7. Update deepest location with extra fields provided it's new (avoids updating existing)
      if (isNew) {
        await prisma.location.update({
          where: { id: lowestLocationId },
          data: {
            address: formattedAddress || undefined,
            categoryId: categoryId || undefined,
            telephone: telephone || undefined,
            email: email || undefined,
          },
        });
      } else {
        rowErrors.push(`Row ${rowNumber}: Duplicate location path detected.`);
        continue;
      }
    }

    importCount++;
    console.log(`Import Count: ${importCount}`);
    console.log(`Row Errors:`, rowErrors);

    return { importCount, rowErrors };
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
}

// Used when importing assets / people from csv data to find lowest location from provided location values
// Takes in location values from csv data, returns lowest matched locationId to then use when creating the asset / person etc.
export function getLocationIdFromCSVData(
  levelOne,
  levelTwo,
  levelThree,
  levelFour,
  levelFive,
  locations
) {
  const root = locations.find((loc) => loc.level === 0);
  if (!root) throw new Error("Root location not found");

  let parentId = root.id;
  let currentId = root.id;

  const levels = [levelOne, levelTwo, levelThree, levelFour, levelFive];

  for (let i = 0; i < levels.length; i++) {
    const value = levels[i];
    if (!value) break;

    const location = locations.find(
      (loc) =>
        loc.parentLocationId === parentId &&
        loc.level === i + 1 &&
        loc.description.toLowerCase() === value.toLowerCase()
    );

    if (!location) return null;

    currentId = location.id;
    parentId = location.id;
  }

  return currentId;
}

// Used when creating a location to set the materialised path
export async function getMaterialisedPathAndLevel(
  parentLocationId,
  currentId,
  currentDescription
) {
  let materialisedPath = [];
  let level = 0;

  const parent = await prisma.location.findUnique({
    where: { id: parentLocationId },
    select: { materialisedPath: true, level: true },
  });

  if (!parent) throw new Error("Parent location not found");

  // Copy parent's path
  materialisedPath = parent.materialisedPath
    ? [...parent.materialisedPath]
    : [];

  // Append current location itself
  materialisedPath.push({ id: currentId, description: currentDescription });
  level = (parent.level ?? 0) + 1; // fallback as parent.level will be null on root location

  return { materialisedPath, level };
}

// Used when updating a location and description has changed
// Updates materialised path on all descendant locations
export async function updateDescendantMaterialisedPaths(
  locationId,
  newDescription
) {
  //Fetch all descendants where materialisedPath contains the ancestor ID
  const descendants = await prisma.$queryRaw`
  SELECT *
  FROM "Location"
  WHERE "materialisedPath" @> jsonb_build_array(jsonb_build_object('id', ${locationId}));
`;

  for (const desc of descendants) {
    // Update the materialisedPath in JS
    const updatedPath = desc.materialisedPath.map((node) =>
      node.id === locationId ? { ...node, description: newDescription } : node
    );

    // Update the record using Prisma
    await prisma.location.update({
      where: { id: desc.id },
      data: { materialisedPath: updatedPath },
    });
  }
}
