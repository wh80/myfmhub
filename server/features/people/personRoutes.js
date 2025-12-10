import { Router } from "express";
import {
  createPerson,
  getAllPeople,
  getPersonbyId,
  updatePerson,
  deletePerson,
} from "./controllers/personController.js";

import { getJobsForPerson } from "./controllers/personJobsController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createPerson); // POST /people
router.get("/", getAllPeople); // GET /people
router.get("/:id", getPersonbyId); // GET /people/:id
router.put("/:id", updatePerson); // PUT /people/:id
router.delete("/:id", deletePerson); // DELETE /people/:id

//Related Data

router.get("/:id/jobs", getJobsForPerson);

export default router;
