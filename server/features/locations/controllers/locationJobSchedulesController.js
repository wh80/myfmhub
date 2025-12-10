import prisma from "../../../config/prisma.js";
import { getDescendantLocationIds } from "../../../utils/locationUtils.js";

export async function getJobSchedulesForLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    // get all descendant location ID's as want schedules for them too
    const allLocIds = await getDescendantLocationIds(id);

    const schedules = await prisma.jobSchedule.findMany({
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

    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch job schedules" });
  }
}
