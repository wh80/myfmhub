import prisma from "../../config/prisma.js";

/**
 * Updates the full ancestral path (materialized tree) for a given location.
 * Runs when updating a locations description
 * Update the materialisedPath all child locations
 */

export function updateDescriptionInTree(tree, updatedId, newDescription) {
  if (!Array.isArray(tree)) {
    return tree; // Should be an array, but defensive check
  }

  return tree.map((node) => {
    if (node && node.id === updatedId) {
      // Return a new object to ensure immutability when mapping
      return { ...node, description: newDescription };
    }
    return node;
  });
}

/**
 *Gets all descendant locations for a given location
 */
// export async function getAllDescendantLocations(locationId, prismaClient) {
//   const descendants = [];

//   async function fetchChildren(parentId) {
//     const children = await prismaClient.location.findMany({
//       where: { parentId: parentId },
//       select: {
//         id: true,
//         description: true,
//         level: true,
//       },
//     });

//     for (const child of children) {
//       descendants.push(child);
//       await fetchChildren(child.id); // recurse
//     }
//   }

//   await fetchChildren(locationId);
//   return descendants;
// }

/**
 *Gets all descendant locationIds for a given location
 */
export async function getDescendantLocationIds(locationId) {
  const descendants = await prisma.$queryRaw`
    SELECT id FROM "Location"
    WHERE "materialisedPath" @> jsonb_build_array(
      jsonb_build_object('id', ${locationId})
    )
  `;

  return descendants.map((d) => d.id);
}

/**
 *Gets all ancestral locations for a given location
 */
export async function getAllAncestorLocations(locationId, prismaClient) {
  const ancestors = [];

  async function fetchParent(childId) {
    const location = await prismaClient.location.findUnique({
      where: { id: childId },
      select: {
        parentLocation: {
          select: {
            id: true,
            description: true,
            level: true,
          },
        },
      },
    });

    if (location?.parentLocation) {
      const parent = location.parentLocation;
      ancestors.push(parent);
      await fetchParent(parent.id); // recurse up
    }
  }

  await fetchParent(locationId);
  return ancestors;
}

// Converts flat locations into a nested array / tree -> used when returning locations from API
export function buildLocationTree(locations) {
  if (!locations || locations.length === 0) return [];

  const locationMap = new Map();
  locations.forEach((location) => {
    locationMap.set(location.id, {
      ...location,
      key: location.id,
      label: location.description,
      children: [],
    });
  });

  const tree = [];
  locations.forEach((location) => {
    const node = locationMap.get(location.id);

    if (!location.parentId) {
      tree.push(node);
    } else {
      const parentNode = locationMap.get(location.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return tree;
}

/**
 * Finds a location by matching against materialisedPath
 * CSV:  ['site 1', 'Main Building']
    Path: [{root}, {site 1}, {Main Building}]
              ↑        ↑         ↑
           index 0  index 1   index 2
            (skip)  (match 0) (match 1)

 */
export function findLocationByMaterialisedPath(existingLocations, levels) {
  if (levels.length === 0) {
    // No levels provided = looking for root
    return (
      existingLocations.find((loc) => loc.materialisedPath?.length === 1) ||
      null
    );
  }

  return (
    existingLocations.find((loc) => {
      const path = loc.materialisedPath || [];

      // Path = root + provided levels, so length should be levels.length + 1
      if (path.length !== levels.length + 1) return false;

      // Compare levels against path starting from index 1 (skip root at index 0)
      return levels.every(
        (desc, idx) =>
          path[idx + 1]?.description?.toLowerCase() === desc.toLowerCase()
      );
    }) || null
  );
}
