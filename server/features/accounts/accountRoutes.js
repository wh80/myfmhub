import { Router } from "express";
import { registerAccount } from "./accountController.js";

const router = Router();

router.post("/register", registerAccount);

export default router;
