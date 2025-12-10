import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import prisma from "../config/dbConnection.js";

// Used in data import help compare csv value with db value
//Removes whitespace etc.

export function normaliseString(str) {
  return str
    .trim() // remove leading/trailing whitespace
    .toLowerCase()
    .replace(/\s*-\s*/g, " - ") // normalize spaces around dashes
    .replace(/\s+/g, " "); // collapse multiple spaces
}

// Used in controllers to correctly format 400 errors
export function validationErrorResponse(res, errors) {
  console.log("VALIDATION ERRORS:");
  console.log(errors);
  return res.status(400).json({
    errors: errors.map(({ field, message }) => ({
      field,
      message,
    })),
  });
}

// Used to generate secure tokens for email urls (i.e password reset)
export async function generateSecureToken(length = 32) {
  const tokenString = randomBytes(length).toString("hex");

  const expiresAt = addHours(new Date(), 24);

  const tokenObj = await prisma.emailToken.create({
    data: {
      token: tokenString,
      expiresAt,
    },
  });
  console.log(tokenObj);

  return tokenObj.token;
}

// Used within data imports to set importEventId on imported objects

export async function createImportEvent(description, accountId, userId) {
  const fullDescription = `${description} - ${new Date().toISOString()}`;
  try {
    const newEvent = await prisma.importEvent.create({
      data: {
        description: fullDescription,
        account: {
          connect: {
            id: accountId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return newEvent.id;
  } catch (error) {
    console.error("Failed to create import event:", error);
    throw new Error("Failed to create import event");
  }
}
