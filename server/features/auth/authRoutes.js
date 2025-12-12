import { Router } from "express";
import {
  loginUser,
  validateAuth,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "./authController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", requireAuth, updatePassword);
router.get("/validate", requireAuth, validateAuth);

export default router;
