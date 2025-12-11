import prisma from "../../../config/prisma.js";
import { createJobScheduleSchema, updateJobScheduleSchema } from "../schema.js";
import { calculateNextJobCreationDate } from "../../../utils/jobScheduleUtils.js";

export async function createJobSchedule(req, res) {
  const requestData = req.body;
  const accountId = req.user.accountId;

  const validated = createJobScheduleSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const {
    summary,
    description,
    nextDue,
    noticeDays,
    statutoryCompliance,
    recurrenceInterval,
    recurrenceUnit,
    locationId,
    categoryId,
    jobCategoryId,
  } = validated.data;

  // Calculate next job creation date
  const nextJobCreationDate = await calculateNextJobCreationDate(
    nextDue,
    noticeDays,
    accountId
  );

  try {
    const created = await prisma.jobSchedule.create({
      data: {
        summary,
        description,
        nextDue,
        statutoryCompliance,
        recurrenceInterval,
        recurrenceUnit,
        noticeDays,
        nextJobCreationDate,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        jobCategory: jobCategoryId
          ? { connect: { id: jobCategoryId } }
          : undefined,

        location: { connect: { id: locationId } },

        account: { connect: { id: accountId } },
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create jobSchedule" });
  }
}

export async function getAllJobSchedules(req, res) {
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
    const jobSchedules = await prisma.jobSchedule.findMany({
      where: whereQuery,
      include: {
        location: {
          select: { materialisedPath: true },
        },
        category: { select: { description: true } },
        jobCategory: { select: { description: true } },
      },
    });

    res.json(jobSchedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobSchedules" });
  }
}

export async function getJobSchedulebyId(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    const jobSchedule = await prisma.jobSchedule.findUnique({
      where: { id, accountId },
      include: {
        location: { select: { materialisedPath: true } },
        category: { select: { description: true } },
        jobCategory: { select: { description: true } },
      },
    });

    if (!jobSchedule) {
      return res.status(404).json({ error: "JobSchedule not found" });
    }

    res.json(jobSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to find jobSchedule" });
  }
}

export async function updateJobSchedule(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;
  const requestData = req.body;

  const validated = updateJobScheduleSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json({ error: validated.error });
  }

  const {
    description,
    summary,
    nextDue,
    noticeDays,
    statutoryCompliance,
    recurrenceInterval,
    recurrenceUnit,
    locationId,
    categoryId,
    jobCategoryId,
  } = validated.data;

  try {
    const updated = await prisma.jobSchedule.update({
      where: { id, accountId },
      data: {
        description,
        summary,
        nextDue,
        noticeDays,
        statutoryCompliance,
        recurrenceInterval,
        recurrenceUnit,
        location: { connect: { id: locationId } },
        category: categoryId
          ? { connect: { id: categoryId } }
          : { disconnect: true },
        jobCategory: jobCategoryId
          ? { connect: { id: jobCategoryId } }
          : { disconnect: true },
      },
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "JobSchedule not found" });
    }

    res.status(500).json({ error: "Failed to update jobSchedule" });
  }
}

export async function deleteJobSchedule(req, res) {
  const { id } = req.params;
  const accountId = req.user.accountId;

  try {
    await prisma.jobSchedule.delete({
      where: { id, accountId },
    });
    res.status(204).send(); // No body with 204
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "JobSchedule not found" });
    }

    res.status(500).json({ error: "Failed to delete jobSchedule" });
  }
}
