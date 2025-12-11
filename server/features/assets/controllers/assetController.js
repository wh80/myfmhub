import prisma from "../../../config/prisma.js";
import { createAssetSchema, updateAssetSchema } from "../schema.js";

export async function createAsset(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createAssetSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const {
    description,
    locationId,
    categoryId,
    assetNumber,
    make,
    model,
    serialNumber,
  } = validated.data;

  try {
    const created = await prisma.asset.create({
      data: {
        description,
        assetNumber,
        make,
        model,
        serialNumber,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        location: { connect: { id: locationId } },
        account: { connect: { id: accountId } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create asset" });
  }
}

export async function getAllAssets(req, res) {
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
    const assets = await prisma.asset.findMany({
      where: whereQuery,
      include: {
        location: { select: { materialisedPath: true } },
        category: { select: { description: true } },
      },
    });

    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}

export async function getAssetbyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id, accountId },
      include: {
        location: {
          select: { materialisedPath: true },
        },
        category: { select: { description: true } },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find asset" });
  }
}

export async function updateAsset(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateAssetSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const {
    description,
    locationId,
    categoryId,
    make,
    model,
    serialNumber,
    assetNumber,
  } = validated.data;

  try {
    const updated = await prisma.asset.update({
      where: { id, accountId },
      data: {
        description,
        make,
        model,
        serialNumber,
        assetNumber,
        category: categoryId
          ? { connect: { id: categoryId } }
          : { disconnect: true },
        location: {
          connect: { id: locationId },
        },
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.status(500).json({ error: "Failed to update asset" });
  }
}

export async function deleteAsset(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.asset.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.status(500).json({ error: "Failed to delete asset" });
  }
}
