import prisma from "../../config/prisma.js";
import { createAccountSchema, updateAccountSchema } from "./schema.js";

export async function registerAccount(req, res) {
  const requestData = req.body;

  const validated = createAccountSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json(validated.error);
  }

  // Get validated data
  const { organisation, firstName, lastName, email, password } = validated.data;

  try {
    //Check organisation not a duplicate
    const duplicateAccount = await prisma.account.findFirst({
      where: { description: organisation },
    });

    if (duplicateAccount) {
      return res.status(400).json({ message: "Duplicate organisation" });
    }

    let existingUser;
    let user;

    await prisma.$transaction(async (tx) => {
      // 1. Create new account && Account Settings
      const newAccount = await tx.account.create({
        data: { description: organisation },
      });

      const accountSettings = await tx.accountSetting.create({
        data: {
          accountId: newAccount.id,
        },
      });

      // 2. Check if a user already exists with this email
      existingUser = await tx.user.findUnique({
        where: { email },
      });

      // 3. If not existing user, create them & link to the new account, else link existing user to the new account
      if (!existingUser) {
        user = await tx.user.create({
          data: {
            email,
            password, // TO DO: HASH PASSWORDS!!
            passwordSet: new Date(),
            firstName,
            lastName,
            accounts: { connect: [{ id: newAccount.id }] },
            activeAccountId: newAccount.id,
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            accounts: {
              connect: { id: newAccount.id },
            },
          },
        });
      }

      //4. Create root location on account

      const rootLocation = await tx.location.create({
        data: {
          description: organisation,
          account: {
            connect: { id: newAccount.id },
          },
          materialisedPath: [],
        },
      });

      await tx.location.update({
        where: { id: rootLocation.id },
        data: {
          materialisedPath: [
            {
              id: rootLocation.id,
              description: rootLocation.description,
            },
          ],
        },
      });

      // 5. Create Person. Link to account, user and root location
      await tx.person.create({
        data: {
          isAccountAdmin: true,
          account: {
            connect: { id: newAccount.id },
          },
          location: {
            connect: { id: rootLocation.id },
          },
          user: {
            connect: { id: user.id },
          },
        },
      });
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
}

/**
 *
 * User can only access one account - their own
 * No need to access accounts via /id
 *
 */
export async function getAccountForUser(req, res) {
  const accountId = req.user.accountId;

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    console.log(account);

    res.json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find asset" });
  }
}

export async function updateAccount(req, res) {
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateAccountSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description } = validated.data;

  try {
    const updated = await prisma.account.update({
      where: { id: accountId },
      data: {
        description,
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(500).json({ error: "Failed to update account" });
  }
}

export async function deleteAccount(req, res) {
  const accountId = req.user.accountId;

  try {
    await prisma.account.delete({
      where: { id: accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(500).json({ error: "Failed to delete account" });
  }
}
