import { Readable } from "stream";
import csv from "csv-parser";
import prisma from "$lib/server/prisma";

export default async function importPeopleData(file, companyId) {
  if (!file) {
    return {
      success: false,
      message: "No file uploaded",
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const fileStream = Readable.from(fileBuffer);

    const validHeaders = [
      "firstName",
      "lastName",
      "location",
      "subLocation",
      "category",
      "jobTitle",
      "email",
      "mobilePhone",
      "landlinePhone",
    ];

    let importedCount = 0;
    const rows = [];
    const errors = [];

    // Step 1: Parse CSV File, check headers valid and extract all rows
    await new Promise((resolve, reject) => {
      // Pause the stream to run async DB query
      const parser = csv()
        .on("headers", function (parsedHeaders) {
          // Validate headers
          const invalidHeaders = parsedHeaders.filter(
            (h) => !validHeaders.includes(h)
          );

          if (invalidHeaders.length > 0) {
            reject({
              type: "invalidHeaders",
              message: "Invalid column headers provided",
              invalidHeaders,
            });
          }
        })
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", (err) => {
          if (err?.type === "invalidHeaders") {
            throw err;
          }
          reject;
        });

      fileStream.pipe(parser); // Start streaming the file
    });

    console.log("CSV file successfully processed");

    // Load up any data requred from db

    const existingPeople = await prisma.person.findMany({
      where: { companyId },
    });
    const locations = await prisma.location.findMany({ where: { companyId } });
    const categories = await prisma.personCategory.findMany({
      where: { companyId },
    });

    // Process each row

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; //factoring in header row

      const newPerson = {};
      for (const validHeader of validHeaders) {
        if (row[validHeader]) {
          newPerson[validHeader] = row[validHeader].trim();
        }
      }

      // Validate fields
      if (!newPerson.firstName || !newPerson.lastName) {
        errors.push({
          rowNumber,
          message: "First name and last name required.",
        });
        continue;
      }

      // Link Locatoin & Sub-Location if provided (not mandatory on people)
      if (newPerson.location) {
        newPerson.locationId =
          locations.find(
            (loc) =>
              loc.description.toLowerCase() === newPerson.location.toLowerCase()
          )?.id || null;

        if (!newPerson.locationId) {
          errors.push({
            rowNumber,
            message: "The location provided could not be found.",
          });
          continue;
        }
      }

      if (newPerson.subLocation) {
        newPerson.subLocationId =
          locations.find(
            (loc) =>
              loc.description.toLowerCase() ===
              newPerson.subLocation.toLowerCase()
          )?.id || null;

        if (!newPerson.subLocationId) {
          errors.push({
            rowNumber,
            message: "The sub-location provided could not be found.",
          });
          continue;
        }
      }

      // Link Category if provided

      if (newPerson.category) {
        newPerson.categoryId =
          categories.find(
            (cat) =>
              cat.description.toLowerCase() === newPerson.category.toLowerCase()
          )?.id || null;

        if (!newPerson.categoryId) {
          errors.push({ rowNumber, message: "Category could not be found" });
          continue;
        }
      }

      // Check duplicates?

      // Create in DB if valid

      const createdPerson = await prisma.person.create({
        data: {
          companyId,
          firstName: newPerson.firstName.trim(),
          lastName: newPerson.lastName.trim(),
          locationId: newPerson.locationId || null,
          subLocationId: newPerson.subLocationId || null,
          categoryId: newPerson.categoryId || null,
          jobTitle: newPerson.jobTitle,
          email: newPerson.email,
          mobile: newPerson.mobile,
          landline: newPerson.landline,
        },
      });

      // Add new location to existingLocations to allow duplicate checking of next row
      existingPeople.push(createdPerson);

      // Increment imported count
      importedCount += 1;
    }

    // Create new locations in DB after processing for each valid row

    // Return the results along with any row errors
    console.log(errors);
    return {
      success: true,
      importedCount,
      errors,
    };
  } catch (error) {
    //Throw error back to +page.server.js to render errors in UI
    if (error?.type === "invalidHeaders") {
      throw error;
    }

    // Handle other unexpected errors
    console.error("Unexpected error processing CSV:", error);
    throw new Error("Unexpected error processing CSV file");
  }
}
