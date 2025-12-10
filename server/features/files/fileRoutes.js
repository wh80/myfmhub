import { Router } from "express";
import {
  createFile,
  getAllFiles,
  getFilebyId,
  updateFile,
  deleteFile,
} from "./fileController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createFile); // POST /files
router.get("/", getAllFiles); // GET /files
router.get("/:id", getFilebyId); // GET /files/:id
router.put("/:id", updateFile); // PUT /files/:id
router.delete("/:id", deleteFile); // DELETE /files/:id

export default router;
