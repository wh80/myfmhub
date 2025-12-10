import prisma from "../../../config/prisma.js";
import { getDescendantLocationIds } from "../../../utils/locationUtils.js";

export async function getAssetsForLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    // get all descendant location ID's as want assets for them too
    const allLocIds = await getDescendantLocationIds(id);

    const assets = await prisma.asset.findMany({
      where: {
        locationId: {
          in: allLocIds,
        },
        accountId,
      },
      include: {
        location: {
          select: { materialisedPath: true },
        },
      },
    });

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}
