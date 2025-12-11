import prisma from "../../../config/prisma.js";
import { createJobSchema, updateJobSchema } from "../schema.js";

export async function createJob(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createJobSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { summary, description, locationId, categoryId } = validated.data;

  try {
    const created = await prisma.job.create({
      data: {
        summary,
        description,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        location: { connect: { id: locationId } },
        account: { connect: { id: accountId } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create job" });
  }
}

export async function getAllJobs(req, res) {
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
    const jobs = await prisma.job.findMany({
      where: whereQuery,
      include: {
        location: { select: { materialisedPath: true } },
        category: { select: { description: true } },
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

export async function getJobbyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const job = await prisma.job.findUnique({
      where: { id, accountId },
      include: {
        location: { select: { materialisedPath: true } },
        category: { select: { description: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find job" });
  }
}

export async function updateJob(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateJobSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const { summary, description, locationId, categoryId } = validated.data;

  try {
    const updated = await prisma.job.update({
      where: { id, accountId },
      data: {
        description,
        summary,
        category: categoryId
          ? { connect: { id: categoryId } }
          : { disconnect: true },
        location: { connect: { id: locationId } },
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(500).json({ error: "Failed to update job" });
  }
}

export async function deleteJob(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.job.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(500).json({ error: "Failed to delete job" });
  }
}
