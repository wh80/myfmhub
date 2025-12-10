import prisma from "../../../config/prisma.js";
import { createPersonSchema, updatePersonSchema } from "../schema.js";

export async function createPerson(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createPersonSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { firstName, lastName, email, jobTitle, locationId } = validated.data;

  try {
    let userIdForNewPerson = null;

    // check if email already in use on a user.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // if no existing user account, create new user
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: "password", //**TO DO - ENC PASSWORD */
          firstName,
          lastName,
          jobTitle,

          activeAccountId: accountId,
          accounts: {
            connect: { id: accountId },
          },
        },
      });

      userIdForNewPerson = newUser.id;
      // Send welcome email?
    } else {
      userIdForNewPerson = existingUser.id;
      // Send email to user to tell them they've been added to a new account / option to delete
    }

    // Create new person - linking to relevant account
    const created = await prisma.person.create({
      data: {
        location: {
          connect: { id: locationId },
        },
        account: { connect: { id: accountId } },
        user: { connect: { id: userIdForNewPerson } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create person" });
  }
}

export async function getAllPeople(req, res) {
  const { description, search } = req.query;
  const accountId = req.user.accountId;

  const whereQuery = { accountId };

  // Build where clause dynamically
  if (description) {
    whereQuery.description = { contains: description, mode: "insensitive" };
  }

  if (search) {
    whereQuery.OR = [
      { description: { contains: search, mode: "insensitive" } },
      // Add other searchable fields here
    ];
  }

  try {
    const people = await prisma.person.findMany({
      where: whereQuery,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
        location: { select: { materialisedPath: true } },
      },
    });

    res.status(200).json(people);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
}

export async function getPersonbyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const person = await prisma.person.findUnique({
      where: { id, accountId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
        location: { select: { materialisedPath: true } },
      },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.status(200).json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find person" });
  }
}

export async function updatePerson(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updatePersonSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { locationId, firstName, lastName, email, mobile, jobTitle } =
    validated.data;

  console.log(email);

  // Check if email has been updated and if so, ensure not duplicate

  const person = await prisma.person.findFirst({
    where: { id, accountId },
    include: { user: { select: { id: true, email: true } } },
  });

  if (person.user.email !== email) {
    // email has been updated - need to check not in user on another user account
    const emailInUse = await prisma.user.findFirst({
      where: email,
    });
    if (emailInUse) {
      return res
        .status(400)
        .json({ message: "This email is already in use by another user." });
    }
  }

  try {
    // update person data
    const updatedPerson = await prisma.person.update({
      where: { id, accountId },
      data: {
        location: {
          connect: { id: locationId },
        },
      },
      select: { id: true },
    });

    // update user data

    await prisma.user.update({
      where: { id: person.user.id },
      data: {
        firstName,
        lastName,
        email,
        mobile,
        jobTitle,
      },
    });
    res.status(200).json(updatedPerson);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Person not found" });
    }

    res.status(500).json({ error: "Failed to update person" });
  }
}

export async function deletePerson(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.person.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Person not found" });
    }

    res.status(500).json({ error: "Failed to delete person" });
  }
}
