import prisma from "../../../config/prisma.js";

export async function getJobsForPerson(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        accountId,
        people: {
          some: {
            id: id,
          },
        },
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
