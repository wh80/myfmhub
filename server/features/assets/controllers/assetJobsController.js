import prisma from "../../../config/prisma.js";

export async function getJobsForAsset(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        accountId,
        assets: {
          some: {
            id: id,
          },
        },
      },
      include: {
        location: { select: { materialisedPath: true } },
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

export async function linkAssetToJobs(req, res) {
  const { id } = req.params;
  const jobIds = req.body;

  try {
    await prisma.asset.update({
      where: { id },
      data: {
        jobs: {
          connect: jobIds.map((jobId) => ({ id: jobId })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to link asset to jobs." });
  }
}

export async function unlinkAssetFromJobs(req, res) {
  const { id } = req.params;
  const jobIds = req.body;

  try {
    await prisma.asset.update({
      where: { id },
      data: {
        jobs: {
          disconnect: jobIds.map((jobId) => ({ id: jobId })),
        },
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to link asset to jobs." });
  }
}
