// src/modules/dashboard/dashboard.routes.js
import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/stats", dashboardController.getDashboardStats);
router.get("/schedule", dashboardController.getSchedule);
router.post("/interviews", dashboardController.createInterview);
router.patch("/interviews/:id", dashboardController.updateInterview);

export default router;
