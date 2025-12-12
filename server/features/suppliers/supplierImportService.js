import prisma from "../../config/prisma.js";
import Papa from "papaparse";
import { createSupplierSchema } from "./schema.js";

export const validHeaders = [
  "description",
  "address",
  "telephone",
  "email",
  "skills",
];

export async function importSupplierData(csvText, accountId) {
  let importCount = 0;
  let errorRows = [];
  let validRows = [];

  const existingSuppliers = await prisma.supplier.findMany({
    where: { accountId },
    select: { description: true, accountId: true, id: true },
  });

  const result = Papa.parse(csvText, {
    header: true, // Convert to objects using headers
    skipEmptyLines: true, // Ignore blank lines
    transformHeader: (h) => h.trim(), // Clean headers
    dynamicTyping: (field) => field !== "telephone",
  });

  if (result.errors.length > 0) {
    return { errors: result.errors };
  }

  // Clean row data
  const data = result.data;

  // Process each ros
  for (let i = 0; i < data.length; i++) {
    const rowNumber = i + 2; // +2 to account for CSV header
    const csvRow = data[i];

    // Extract values
    const description = csvRow["description"]?.trim() || undefined;
    const address = csvRow["address"]?.trim() || undefined;
    const telephone = csvRow["telephone"]?.trim() || undefined; // Can't trim as will error if phone provided as int
    const email = csvRow["email"]?.trim() || undefined;

    const validated = createSupplierSchema.safeParse({
      description,
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

    // Duplicate check on description
    let duplicate = existingSuppliers.find(
      (supplier) =>
        supplier.description.toLowerCase() == description.toLowerCase()
    );

    if (duplicate) {
      errorRows.push(
        `Row ${rowNumber}: A supplier with this description already exists.`
      );
      continue;
    }

    // Convert address to display correctly in textarea
    let formattedAddress;
    if (address) {
      formattedAddress = address
        .split(",")
        .map((line) => line.trim())
        .join("\n");
    }

    const newSupplier = {
      description: validated.data.description,
      address: formattedAddress,
      telephone: validated.data.telephone,
      accountId,
    };

    existingSuppliers.push(newSupplier);
    validRows.push(newSupplier);
    importCount++;
  }

  if (validRows.length > 0) {
    await prisma.supplier.createMany({
      data: validRows,
      skipDuplicates: true,
    });
  }

  return { importErrors: errorRows, importCount };
}
