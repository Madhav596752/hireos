// src/modules/candidates/candidates.routes.js
import { Router } from "express";
import * as candidatesController from "./candidates.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { hrAndAbove } from "../../middleware/rbac.js";

const router = Router();

router.use(authenticate);

router.get("/", candidatesController.listCandidates);
router.get("/:id/recommendations", candidatesController.getRecommendations);
router.get("/:id", candidatesController.getCandidate);
router.post("/", candidatesController.createCandidate); // ✅ FIX: removed hrAndAbove so RECRUITER can also create candidates
router.post("/bulk-import", candidatesController.bulkImportCandidates); // CSV bulk import
router.post("/bulk-import-and-screen", candidatesController.bulkImportAndScreenCandidates); // CSV + AI screen + email
router.patch("/:id", candidatesController.updateCandidate);
router.patch("/:id/stage", candidatesController.updateStage);
router.delete("/:id", hrAndAbove, candidatesController.deleteCandidate); // delete still HR/ADMIN only

export default router;