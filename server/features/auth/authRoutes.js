import { Router } from "express";
import { loginUser, validateAuth } from "./authController.js";

const router = Router();

import { requireAuth } from "../../middleware.js/auth.js";

router.post("/login", loginUser);
router.get("/validate", requireAuth, validateAuth);

export default router;
