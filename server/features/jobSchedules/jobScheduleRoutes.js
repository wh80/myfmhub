import { Router } from "express";
import {
  createJobSchedule,
  getAllJobSchedules,
  getJobSchedulebyId,
  updateJobSchedule,
  deleteJobSchedule,
} from "./controllers/jobScheduleController.js";

import {
  getAssetsForJobSchedule,
  linkJobScheduleToAssets,
  unlinkJobScheduleFromAssets,
} from "./controllers/jobScheduleAssetsController.js";
import { getJobsForJobSchedule } from "./controllers/jobScheduleJobsController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createJobSchedule); // POST /job-schedules
router.get("/", getAllJobSchedules); // GET /job-schedules
router.get("/:id", getJobSchedulebyId); // GET /job-schedules/:id
router.put("/:id", updateJobSchedule); // PUT /job-schedules/:id
router.delete("/:id", deleteJobSchedule); // DELETE /job-schedules/:id

// Related Data

router.get("/:id/jobs", getJobsForJobSchedule);
router.get("/:id/assets", getAssetsForJobSchedule);
router.post("/:id/assets", linkJobScheduleToAssets);
router.delete("/:id/assets", unlinkJobScheduleFromAssets);

export default router;
