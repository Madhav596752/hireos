// src/modules/interviews/interviews.routes.js
import { Router } from "express";
import * as interviewsController from "./interviews.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/",       interviewsController.scheduleInterview);
router.get("/",        interviewsController.listInterviews);
router.get("/:id",     interviewsController.getInterview);
router.patch("/:id",   interviewsController.updateInterview);
router.delete("/:id",  interviewsController.deleteInterview);

export default router;
