import prisma from "../../../config/prisma.js";

export async function getAssetsForJob(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const assets = await prisma.asset.findMany({
      where: {
        accountId,
        jobs: {
          some: {
            id: id,
          },
        },
      },
      include: {
        location: { select: { materialisedPath: true } },
      },
    });

    res.status(200).json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}

export async function linkJobToAssets(req, res) {
  const { id } = req.params;
  const assetIds = req.body;

  try {
    await prisma.job.update({
      where: { id },
      data: {
        assets: {
          connect: assetIds.map((assetId) => ({ id: assetId })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to link job to assets." });
  }
}

export async function unlinkJobFromAssets(req, res) {
  const { id } = req.params;
  const assetIds = req.body;

  try {
    await prisma.job.update({
      where: { id },
      data: {
        assets: {
          disconnect: assetIds.map((assetId) => ({ id: assetId })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to link unlink job from assets." });
  }
}
