import prisma from "../../../config/prisma.js";

export async function getAssetsForJobSchedule(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const assets = await prisma.asset.findMany({
      where: {
        accountId,
        jobSchedules: {
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

export async function linkJobScheduleToAssets(req, res) {
  const { id } = req.params;
  const assetIds = req.body;

  try {
    await prisma.jobSchedule.update({
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
    res.status(500).json({ error: "Failed to link job schedule to assets." });
  }
}

export async function unlinkJobScheduleFromAssets(req, res) {
  console.log("REceived unlink request");
  const { id } = req.params;
  const assetIds = req.body;

  try {
    await prisma.jobSchedule.update({
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
    res
      .status(500)
      .json({ error: "Failed to link unlink job schedule from assets." });
  }
}
