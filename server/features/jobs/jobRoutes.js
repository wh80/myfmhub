import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobbyId,
  updateJob,
  deleteJob,
} from "./controllers/jobController.js";

import {
  getAssetsForJob,
  linkJobToAssets,
  unlinkJobFromAssets,
} from "./controllers/jobAssetsController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createJob); // POST /jobs
router.get("/", getAllJobs); // GET /jobs
router.get("/:id", getJobbyId); // GET /jobs/:id
router.put("/:id", updateJob); // PUT /jobs/:id
router.delete("/:id", deleteJob); // DELETE /jobs/:id

// Related Data

router.get("/:id/assets", getAssetsForJob);
router.post("/:id/assets", linkJobToAssets);
router.delete("/:id/assets", unlinkJobFromAssets);

export default router;
