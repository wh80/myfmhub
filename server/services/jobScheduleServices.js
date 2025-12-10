import { Readable } from "stream";
import csv from "csv-parser";
import prisma from "$lib/server/prisma";
import { formatDateForSaving } from "../dateFormatters";

export default async function importPPMData(file, companyId) {
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
      "summary",
      "description",
      "location",
      "subLocation",
      "jobCategory",
      "referenceCode",
      "intervalFrequency",
      "intervalUnit",
      "nextDue",
      "noticeDays",
      "statutoryCompliance",
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
    const existingSchedules = await prisma.jobSchedule.findMany({
      where: { companyId },
    });
    const locations = await prisma.location.findMany({ where: { companyId } });
    const jobCategories = await prisma.jobCategory.findMany({
      where: { companyId },
    });
    // Process each row

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; //factoring in header row

      const newSchedule = {};
      for (const validHeader of validHeaders) {
        if (row[validHeader]) {
          newSchedule[validHeader] = row[validHeader].trim();
        }
      }

      // Validate fields
      if (!newSchedule.summary) {
        errors.push({ rowNumber, message: "Summary not provided" });
        continue;
      }

      if (!newSchedule.location) {
        errors.push({ rowNumber, message: "A location must be provided" });
        continue;
      }

      if (!newSchedule.intervalFrequency) {
        errors.push({
          rowNumber,
          message: "Interval frequency must be provided",
        });
        continue;
      }

      if (!newSchedule.intervalUnit) {
        errors.push({ rowNumber, message: "Interval unit must be provided" });
        continue;
      }

      if (!newSchedule.nextDue) {
        errors.push({ rowNumber, message: "Next due date must be provided" });
        continue;
      }

      if (!newSchedule.noticeDays) {
        errors.push({ rowNumber, message: "Notice days must be provided" });
        continue;
      }

      // Link location & sub-location
      // Location is mandatory, sub-location is optional
      newSchedule.locationId =
        locations.find(
          (loc) =>
            loc.description.toLowerCase() === newSchedule.location.toLowerCase()
        )?.id || null;

      if (!newSchedule.locationId) {
        errors.push({
          rowNumber,
          message: "The location provided could not be found.",
        });
        continue;
      }

      if (newSchedule.subLocation) {
        newSchedule.subLocationId =
          locations.find(
            (loc) =>
              loc.description.toLowerCase() ===
              newSchedule.subLocation.toLowerCase()
          )?.id || null;

        if (!newSchedule.subLocationId) {
          errors.push({
            rowNumber,
            message: "The sub-location provided could not be found.",
          });
          continue;
        }
      }

      // Link Job Category if provided

      if (newSchedule.jobCategory) {
        newSchedule.jobCategoryId =
          jobCategories.find(
            (cat) =>
              cat.description.toLowerCase() ===
              newSchedule.jobCategory.toLowerCase()
          )?.id || null;

        if (!newSchedule.jobCategoryId) {
          errors.push({
            rowNumber,
            message: "Job category could not be found",
          });
          continue;
        }
      }

      // Validate & Format Date Fields
      if (newSchedule.nextDue) {
        newSchedule.nextDue = formatDateForSaving(newSchedule.nextDue);
        if (!newSchedule.warrantyExpiry) {
          errors.push({ rowNumber, message: "Next due date invalid." });
          continue;
        }
      }

      // Check duplicates??
      // To implement

      // Create in DB if valid

      const createdSchedule = await prisma.jobSchedule.create({
        data: {
          companyId,
          summary: newSchedule.summary,
          description: newSchedule.description || null,
          locationId: newSchedule.locationId,
          subLocationId: newSchedule.subLocationId,
          jobCategoryId: newSchedule.jobCategoryId,
          referenceCode: newSchedule.referenceCode,
          intervalFrequency: parseInt(newSchedule.intervalFrequency),
          intervalUnit: newSchedule.intervalUnit,
          nextDue: newSchedule.nextDue,
          noticeDays: parseInt(newSchedule.noticeDays),
          statutoryCompliance: newSchedule.statutoryCompliance,
        },
      });

      // Add new location to existingLocations to allow duplicate checking of next row
      existingSchedules.push(createdSchedule);

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
    if (error?.type === "invalidHeaders") {
      throw error;
    }
    // Handle other unexpected errors
    console.error("Unexpected error processing CSV:", error);
    throw new Error("Unexpected error processing CSV file");
  }
}
