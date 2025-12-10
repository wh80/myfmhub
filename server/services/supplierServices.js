import prisma from "../config/dbConnection.js";
import { createImportEvent } from "../utils/generalUtils.js";

export async function importSupplierDataService(data, accountId, userId) {
  let importCount = 0;
  const rowErrors = [];
  try {
    // Create import event
    const importId = await createImportEvent(
      "Supplier Import",
      accountId,
      userId
    );

    // Load existing data
    const existingSuppliers = await prisma.supplier.findMany({
      where: { accountId },
    });

    const existingCategories = await prisma.supplierCategory.findMany({
      where: { accountId },
    });

    // Loop each row in the csv data
    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2; // Needs to be 2 to align with csv data (allow for header)
      const csvRow = data[i];

      const description = csvRow["description"].trim();
      const category = csvRow["category"]?.trim();
      const address = csvRow["address"]?.trim();
      const email = csvRow["email"]?.trim();
      const telephone = csvRow["telephone"]?.trim();
      const website = csvRow["website"]?.trim();

      // Combine & format address values
      let formattedAddress;
      if (address) {
        formattedAddress = address
          .split(",")
          .map((line) => line.trim())
          .join("\n");
      }

      // Check not duplicate
      const duplicate = existingSuppliers.find(
        (obj) => obj.description.toLowerCase() === description.toLowerCase()
      );

      if (duplicate) {
        rowErrors.push(
          `Row ${rowNumber}: A supplier with this description already exists on the specified site:  "${description}"`
        );
        continue;
      }

      // Check category exists or create

      let categoryId;
      if (category) {
        const existingCategory = existingCategories.find(
          (cat) => cat.description.toLowerCase() === category.toLowerCase()
        );

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const newCategory = await prisma.supplierCategory.create({
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
      const newSupplier = await prisma.supplier.create({
        data: {
          description,
          email,
          telephone,
          website,
          address: formattedAddress,
          account: { connect: { id: accountId } },

          ...(category && {
            category: {
              connect: {
                id: categoryId,
              },
            },
          }),

          importEvent: {
            connect: {
              id: importId,
            },
          },
        },
      });

      existingSuppliers.push(newSupplier);
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
