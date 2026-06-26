// src/modules/screening/screening.routes.js
import { Router } from "express";
import * as screeningController from "./screening.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { uploadResume } from "../../config/cloudinary.js";

const router = Router();

router.use(authenticate);

// Screen a resume (PDF upload or raw text)
router.post(
  "/screen",
  uploadResume.single("resume"),
  screeningController.screenResume
);

// Generate interview questions
router.post("/questions", screeningController.generateInterviewQuestions);

// Get all screenings for a candidate
router.get("/candidate/:candidateId", screeningController.listScreenings);

// Get a single screening
router.get("/:id", screeningController.getScreening);

export default router;
