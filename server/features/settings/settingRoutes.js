import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory,
} from "./controllers/dataCategoryController.js";

import { importData } from "./controllers/dataImportController.js";

import upload from "../../config/multer.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/categories/:categoryType", createCategory);
router.get("/categories/:categoryType", getAllCategories);
router.get("/categories/:categoryType/:id", getCategoryById);
router.put("/categories/:categoryType/:id", updateCategory);
router.delete("/categories/:categoryType/:id", deleteCategory);

router.post("/data-import", upload.single("file"), importData);

export default router;
