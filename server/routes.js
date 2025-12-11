import { Router } from "express";

import accountRoutes from "./features/accounts/accountRoutes.js";
import authRoutes from "./features/auth/authRoutes.js";
import assetRoutes from "./features/assets/assetRoutes.js";
import jobRoutes from "./features/jobs/jobRoutes.js";
import locationRoutes from "./features/locations/locationRoutes.js";
import jobScheduleRoutes from "./features/jobSchedules/jobScheduleRoutes.js";
import personRoutes from "./features/people/personRoutes.js";
import fileRoutes from "./features/files/fileRoutes.js";
import supplierRoutes from "./features/suppliers/supplierRoutes.js";
import settingRoutes from "./features/settings/settingRoutes.js";

const router = Router();

router.use("/accounts", accountRoutes);
router.use("/auth", authRoutes);
router.use("/assets", assetRoutes);
router.use("/jobs", jobRoutes);
router.use("/locations", locationRoutes);
router.use("/job-schedules", jobScheduleRoutes);
router.use("/people", personRoutes);
router.use("/files", fileRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/settings", settingRoutes);

export default router;
