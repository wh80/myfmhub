import { Router } from "express";
import {
  createAsset,
  getAllAssets,
  getAssetbyId,
  updateAsset,
  deleteAsset,
} from "./controllers/assetController.js";

import {
  getJobSchedulesForAsset,
  linkAssetToJobSchedules,
  unlinkAssetFromJobSchedules,
} from "./controllers/assetJobSchedulesController.js";

import {
  getJobsForAsset,
  linkAssetToJobs,
  unlinkAssetFromJobs,
} from "./controllers/assetJobsController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createAsset); // POST /assets
router.get("/", getAllAssets); // GET /assets
router.get("/:id", getAssetbyId); // GET /assets/:id
router.put("/:id", updateAsset); // PUT /assets/:id
router.delete("/:id", deleteAsset); // DELETE /assets/:id

// Related Data

router.get("/:id/job-schedules", getJobSchedulesForAsset);
router.post("/:id/job-schedules", linkAssetToJobSchedules);
router.delete("/:id/job-schedules", unlinkAssetFromJobSchedules);

router.get("/:id/jobs", getJobsForAsset);
router.post("/:id/jobs", linkAssetToJobs);
router.delete("/:id/jobs", unlinkAssetFromJobs);

export default router;
