// src/modules/jobs/jobs.routes.js
import { Router } from "express";
import * as jobsController from "./jobs.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { hrAndAbove, allRoles } from "../../middleware/rbac.js";

const router = Router();

router.use(authenticate);

router.get("/", jobsController.listJobs);
router.get("/:id", jobsController.getJob);

// Recruiter ko bhi allow karo
router.post("/", allRoles, jobsController.createJob);

router.patch("/:id", hrAndAbove, jobsController.updateJob);
router.delete("/:id", hrAndAbove, jobsController.deleteJob);

export default router;
