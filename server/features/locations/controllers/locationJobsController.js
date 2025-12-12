import prisma from "../../../config/prisma.js";
import { getDescendantLocationIds } from "../locationUtils.js";

export async function getJobsForLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    // get all descendant location ID's as want jobs for them too
    const allLocIds = await getDescendantLocationIds(id);

    const jobs = await prisma.job.findMany({
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

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
