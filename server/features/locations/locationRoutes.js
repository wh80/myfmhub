import { Router } from "express";
import {
  createLocation,
  getAllLocations,
  getLocationbyId,
  updateLocation,
  deleteLocation,
} from "./controllers/locationController.js";

import { getAssetsForLocation } from "./controllers/locationAssetsController.js";
import { getJobsForLocation } from "./controllers/locationJobsController.js";
import { getJobSchedulesForLocation } from "./controllers/locationJobSchedulesController.js";
import { getPeopleForLocation } from "./controllers/locationPeopleController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createLocation); // POST /locations
router.get("/", getAllLocations); // GET /locations
router.get("/:id", getLocationbyId); // GET /locations/:id
router.put("/:id", updateLocation); // PUT /locations/:id
router.delete("/:id", deleteLocation); // DELETE /locations/:id

router.get("/:id/assets", getAssetsForLocation);
router.get("/:id/jobs", getJobsForLocation);
router.get("/:id/job-schedules", getJobSchedulesForLocation);
router.get("/:id/people", getPeopleForLocation);

export default router;
