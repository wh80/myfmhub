import prisma from "../config/dbConnection.js";
import { createImportEvent } from "../utils/generalUtils.js";
import { getLocationIdFromCSVData } from "./locationServices.js";

export async function importAssetDataService(data, accountId, userId) {
  let importCount = 0;
  const rowErrors = [];

  try {
    // Create import event
    const importId = await createImportEvent("Asset Import", accountId, userId);

    // Load data required to set relationships

    // ** NO DUPLICATE CHECKS ON ASSET IMPORT**

    let existingLocations = await prisma.location.findMany({
      where: { accountId },
    });

    const existingCategories = await prisma.assetCategory.findMany({
      where: { accountId },
    });

    const existingConditions = await prisma.assetConditionCategory.findMany({
      where: { accountId },
    });

    // Loop each row in the csv data
    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2; // Needs to be 2 to align with csv data (allow for header)
      const csvRow = data[i];

      // Extract data from CSV
      const locationLevelOne = csvRow["locationLevelOne"]?.trim();
      const locationLevelTwo = csvRow["locationLevelTwo"]?.trim();
      const locationLevelThree = csvRow["locationLevelThree"]?.trim();
      const locationLevelFour = csvRow["locationLevelFour"]?.trim();
      const locationLevelFive = csvRow["locationLevelFive"]?.trim();

      const description = csvRow["description"]?.trim();
      const assetNumber = csvRow["assetNumber"]?.trim();
      const make = csvRow["make"]?.trim();
      const model = csvRow["model"]?.trim();
      const serialNumber = csvRow["serialNumber"]?.trim();

      const category = csvRow["category"]?.trim();
      const condition = csvRow["condition"]?.trim();

      // Set the location
      const locationId = await getLocationIdFromCSVData(
        locationLevelOne,
        locationLevelTwo,
        locationLevelThree,
        locationLevelFour,
        locationLevelFive,
        existingLocations
      );

      if (!locationId) {
        rowErrors.push(
          `Row ${rowNumber}: The specified location could not be found`
        );
        continue;
      }

      // Match or Create Category
      let categoryId;
      if (category) {
        const existingCategory = existingCategories.find(
          (cat) => cat.description.toLowerCase() === category.toLowerCase()
        );

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const newCategory = await prisma.assetCategory.create({
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

      // Match or create Condition

      let conditionId;
      if (condition) {
        const existingCondition = existingConditions.find(
          (cat) => cat.description.toLowerCase() === category.toLowerCase()
        );

        if (existingCondition) {
          conditionId = existingCondition.id;
        } else {
          const newCondition = await prisma.assetConditionCategory.create({
            data: {
              description: condition,
              account: {
                connect: {
                  id: accountId,
                },
              },
            },
          });

          existingConditions.push(newCondition);
          conditionId = newCondition.id;
        }
      }

      const newAsset = await prisma.asset.create({
        data: {
          description,
          assetNumber,
          make,
          model,
          serialNumber,
          account: { connect: { id: accountId } },
          location: { connect: { id: locationId } },

          ...(category && {
            category: {
              connect: {
                id: categoryId,
              },
            },
          }),
          ...(condition && {
            condition: {
              connect: {
                id: conditionId,
              },
            },
            conditionDate: new Date(),
          }),
          importEvent: {
            connect: {
              id: importId,
            },
          },
        },
      });

      importCount++;
    }
    console.log(`Import Count: ${importCount}`);
    console.log(`Row Errors:`, rowErrors);
    return { importCount, rowErrors };
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
}
