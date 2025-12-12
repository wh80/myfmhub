import { Router } from "express";
import {
  registerAccount,
  getAccountForUser,
  updateAccount,
  deleteAccount,
} from "./accountController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

router.post("/register", registerAccount);
router.get("/", requireAuth, getAccountForUser);
router.put("/", requireAuth, updateAccount);
router.delete("/", requireAuth, deleteAccount);

export default router;
