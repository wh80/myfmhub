import prisma from "../../../config/prisma.js";
import { getDescendantLocationIds } from "../../../utils/locationUtils.js";

export async function getPeopleForLocation(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    // get all descendant location ID's as want schedules for them too
    const allLocIds = await getDescendantLocationIds(id);

    const people = await prisma.person.findMany({
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
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
      },
    });

    res.status(200).json(people);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch job people" });
  }
}
