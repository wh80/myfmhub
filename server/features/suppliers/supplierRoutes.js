import { Router } from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierbyId,
  updateSupplier,
  deleteSupplier,
} from "./controllers/supplierController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

// Auth reqired for all routes
router.use(requireAuth);

router.post("/", createSupplier); // POST /suppliers
router.get("/", getAllSuppliers); // GET /suppliers
router.get("/:id", getSupplierbyId); // GET /suppliers/:id
router.put("/:id", updateSupplier); // PUT /suppliers/:id
router.delete("/:id", deleteSupplier); // DELETE /suppliers/:id

export default router;
