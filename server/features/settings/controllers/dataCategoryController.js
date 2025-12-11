import prisma from "../../../config/prisma.js";

import { dataCategorySchema } from "../schema.js";

/**
 *
 * Controller methods scoped by categoryType
 * Handles CRUD operations for all category types
 */

const prismaModels = {
  "location-categories": "locationCategory",
  "asset-categories": "assetCategory",
  "job-categories": "jobCategory",
  "file-categories": "fileCategory",
  "jobschedule-categories": "jobScheduleCategory",
  "skill-categories": "skillCategory",
};

export async function getAllCategories(req, res) {
  const { categoryType } = req.params;
  const accountId = req.user.accountId;

  const prismaModelName = prismaModels[categoryType];

  if (!prismaModelName) {
    return res.status(400).json({ error: "Invalid category type" });
  }

  try {
    const categories = await prisma[prismaModelName].findMany({
      where: {
        accountId,
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

export async function createCategory(req, res) {
  const { categoryType } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const prismaModelName = prismaModels[categoryType];

  if (!prismaModelName) {
    return res.status(400).json({ error: "Invalid category type" });
  }

  const validated = dataCategorySchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description } = validated.data;

  try {
    const created = await prisma[prismaModelName].create({
      data: {
        accountId,
        description,
      },
    });

    res.status(200).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
}
export async function getCategoryById(req, res) {
  const { categoryType, id } = req.params;
  const accountId = req.user.accountId;

  const prismaModelName = prismaModels[categoryType];

  if (!prismaModelName) {
    return res.status(400).json({ error: "Invalid category type" });
  }

  try {
    const category = await prisma[prismaModelName].findUnique({
      where: {
        accountId,
        id,
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find category" });
  }
}
export async function updateCategory(req, res) {
  const { categoryType, id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const prismaModelName = prismaModels[categoryType];

  if (!prismaModelName) {
    return res.status(400).json({ error: "Invalid category type" });
  }

  const validated = dataCategorySchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description } = validated.data;

  try {
    const updated = await prisma[prismaModelName].update({
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
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(500).json({ error: "Failed to update category" });
  }
}
export async function deleteCategory(req, res) {
  const { categoryType, id } = req.params;
  const accountId = req.user.accountId;

  const prismaModelName = prismaModels[categoryType];

  if (!prismaModelName) {
    return res.status(400).json({ error: "Invalid category type" });
  }

  try {
    await prisma[prismaModelName].delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(500).json({ error: "Failed to delete category" });
  }
}
