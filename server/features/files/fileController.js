import prisma from "../../config/prisma.js";
import { createFileSchema, updateFileSchema } from "./schema.js";

export async function createFile(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createFileSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description } = validated.data;

  try {
    const created = await prisma.file.create({
      data: {
        description,
        account: { connect: { id: accountId } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create file" });
  }
}

export async function getAllFiles(req, res) {
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
    const files = await prisma.file.findMany({
      where: whereQuery,
    });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}

export async function getFilebyId(req, res) {
  const { id } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id, accountId },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find file" });
  }
}

export async function updateFile(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateFileSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description } = validated.data;

  try {
    const updated = await prisma.file.update({
      where: { id, accountId },
      data: {
        description,
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(500).json({ error: "Failed to update file" });
  }
}

export async function deleteFile(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.file.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(500).json({ error: "Failed to delete file" });
  }
}
