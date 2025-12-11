import prisma from "../../../config/prisma.js";
import { createLocationSchema, updateLocationSchema } from "../schema.js";
import {
  buildLocationTree,
  getDescendantLocationIds,
} from "../../../utils/locationUtils.js";

export async function createLocation(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createLocationSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description, parentId, locationId, address, telephone, categoryId } =
    validated.data;

  // Duplicate description check

  const parentLoc = await prisma.location.findUnique({
    where: { id: parentId },
    include: { children: true },
  });

  const duplicate = parentLoc.children.find(
    (loc) => loc.description === description
  );

  if (duplicate) {
    return res.status(400).json({
      message:
        "A child location with this description already exists at this location.",
    });
  }

  try {
    const newLocation = await prisma.location.create({
      data: {
        description,
        address,
        telephone,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        parent: {
          connect: { id: parentId },
        },
        account: {
          connect: { id: accountId },
        },
        materialisedPath: [],
      },
      include: {
        parent: true,
      },
    });

    // Set materialisedPath on new location
    await prisma.location.update({
      where: { id: newLocation.id },
      data: {
        materialisedPath: [
          ...newLocation.parent.materialisedPath,
          { id: newLocation.id, description: newLocation.description },
        ],
      },
    });
    res.status(201).json(newLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create location" });
  }
}

export async function getAllLocations(req, res) {
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
    const locations = await prisma.location.findMany({
      where: whereQuery,
      include: {
        category: { select: { description: true } },
      },
    });

    // Convert locations into a tree
    const formattedTreeResponse = buildLocationTree(locations);

    res.json(formattedTreeResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
}

export async function getLocationbyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const location = await prisma.location.findUnique({
      where: { id, accountId },
      include: {
        category: { select: { description: true } },
      },
    });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find location" });
  }
}

export async function updateLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateLocationSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { description, address, telephone, email, categoryId } = validated.data;

  try {
    // Duplicate Description Check

    // 1. Load current loc
    const currentLoc = await prisma.location.findUnique({
      where: { id, accountId },
      select: {
        description: true,
        materialisedPath: true,
        parentId: true,
      },
    });

    if (!currentLoc) {
      return res.status(400).json({ message: "Location could not be found" });
    }

    // 2. Check if descrption changed
    const descriptionUpdated = currentLoc.description !== description;

    // 3. If description has changed && not a root location load parent loc for dupe checks
    // parentLoc declared outside if statement so it can be used for materialised path update in transaction
    let parentLoc = null;
    if (descriptionUpdated && currentLoc.parentId) {
      parentLoc = await prisma.location.findUnique({
        where: { id: currentLoc.parentId, accountId },
        select: {
          materialisedPath: true,
          children: {
            select: {
              id: true,
              description: true,
            },
          },
        },
      });

      // Check for duplicate among parentLoc siblings
      const duplicate = parentLoc.children.find(
        (loc) => loc.description === description && loc.id !== id
      );

      if (duplicate) {
        return res.status(400).json({
          message:
            "A child location with this description already exists at this location.",
        });
      }
    }

    // Commence saving updates
    const updated = await prisma.$transaction(async (tx) => {
      const updateData = {
        description,
        address,
        telephone,
        email,
        category: categoryId
          ? { connect: { id: categoryId } }
          : { disconnect: true },
      };

      // If description changed, update materialisedPath
      if (descriptionUpdated) {
        const newPath = currentLoc.parentId
          ? [...parentLoc.materialisedPath, { id, description }]
          : [{ id, description }];

        updateData.materialisedPath = newPath;
      }

      // Update this location
      const updatedLocation = await tx.location.update({
        where: { id },
        data: updateData,
      });

      // If description changed, cascade to descendants
      if (descriptionUpdated) {
        const descendantIds = await getDescendantLocationIds(id);
        const childIds = descendantIds.filter((descId) => descId !== id);

        for (const childId of childIds) {
          const child = await tx.location.findUnique({
            where: { id: childId },
          });

          const updatedPath = child.materialisedPath.map((node) =>
            node.id === id ? { id, description } : node
          );

          await tx.location.update({
            where: { id: childId },
            data: {
              materialisedPath: updatedPath,
            },
          });
        }
      }
      return updatedLocation;
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(500).json({ error: "Failed to update location" });
  }
}

export async function deleteLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.location.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(500).json({ error: "Failed to delete location" });
  }
}
