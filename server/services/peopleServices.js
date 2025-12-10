import prisma from "../config/dbConnection.js";
import { createImportEvent } from "../utils/generalUtils.js";
import { getLocationIdFromCSVData } from "./locationServices.js";
export async function importPersonDataService(data, accountId, userId) {
  let importCount = 0;
  const rowErrors = [];
  try {
    // Create import event
    const importId = await createImportEvent(
      "Person Import",
      accountId,
      userId
    );

    // Load existing data

    const existingPeople = await prisma.person.findMany({
      where: { accountId },
    });

    let existingLocations = await prisma.location.findMany({
      where: { accountId },
    });

    // Loop each row in the csv data
    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2; // Needs to be 2 to align with csv data (allow for header)
      const csvRow = data[i];
      const locationLevelOne = csvRow["locationLevelOne"]?.trim();
      const locationLevelTwo = csvRow["locationLevelTwo"]?.trim();
      const locationLevelThree = csvRow["locationLevelThree"]?.trim();
      const locationLevelFour = csvRow["locationLevelFour"]?.trim();
      const locationLevelFive = csvRow["locationLevelFive"]?.trim();

      const firstName = csvRow["firstName"]?.trim();
      const lastName = csvRow["lastName"].trim();
      const email = csvRow["email"]?.trim();
      const jobTitle = csvRow["jobTitle"]?.trim();
      const landline = csvRow["landline"]?.trim();
      const mobile = csvRow["mobile"]?.trim();

      // Check not duplicate based on email
      const duplicate = existingPeople.find(
        (obj) => obj.email.toLowerCase() === email.toLowerCase()
      );

      if (duplicate) {
        rowErrors.push(
          `Row ${rowNumber}: A Person with this email already exists "${csvRow["email"]}"`
        );
        continue;
      }

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

      const newPerson = await prisma.person.create({
        data: {
          firstName,
          lastName,
          email,
          jobTitle,
          landline,
          mobile,
          landline,
          account: { connect: { id: accountId } },
          location: { connect: { id: locationId } },

          importEvent: {
            connect: {
              id: importId,
            },
          },
        },
      });

      existingPeople.push(newPerson);
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
