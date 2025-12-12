import prisma from "../config/prisma";
import { endOfDay } from "date-fns";
import {
  calculateNextJobCreationDate,
  calculateNextDueDate,
} from "../../utils.js";

async function main() {
  const jobSchedules = await prisma.jobSchedule.findMany({
    where: {
      nextJobCreationDate: {
        lte: endOfDay(new Date()),
      },
    },
    include: {
      assets: {
        select: { id: true },
      },
    },
  });

  if (!jobSchedules.length) {
    console.log("No schedules due for processing.");
    return;
  }

  console.log(`Processing ${jobSchedules.length} schedule(s)...`);

  // Process each schedule
  for (const schedule of jobSchedules) {
    try {
      // Create the job
      await prisma.job.create({
        data: {
          status: "New",
          summary: schedule.summary,
          description: schedule.description,
          dueBy: schedule.nextDueDate,
          locationId: schedule.locationId,
          categoryId: schedule.jobCategoryId,
          accountId: schedule.accountId,
          statutoryCompliance: schedule.statutoryCompliance,
          source: "Scheduled",
          jobScheduleId: schedule.id,
          ...(schedule.assets.length > 0 && {
            assets: {
              connect: schedule.assets.map((asset) => ({ id: asset.id })),
            },
          }),
        },
      });

      /*
        After job created we set nextDueDate and calculate nextJobCreation date as default
        This can be updated but provides some value for reporting
        Option in account settings to override this when the generated job closes
        */

      // Calculate next occurrence due date
      const nextDueDate = calculateNextDueDate(
        schedule.nextDueDate,
        schedule.recurranceInterval,
        schedule.recurranceUnit
      );

      // Calculate date to create next job based on next due date - notice days
      const nextJobCreationDate = await calculateNextJobCreationDate(
        nextDueDate,
        schedule.noticeDays,
        schedule.accountId
      );

      // Update schedule for next occurrence
      await prisma.jobSchedule.update({
        where: { id: schedule.id },
        data: {
          nextDueDate,
          nextJobCreationDate,
        },
      });

      console.log(`✓ Created job and updated schedule: ${schedule.summary}`);
    } catch (error) {
      console.error(`✗ Failed to process schedule ${schedule.id}:`, error);
      // Continue processing other schedules
    }
  }

  console.log("Scheduled job creation complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
