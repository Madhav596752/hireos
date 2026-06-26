// src/modules/auth/auth.routes.js
import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe);
router.patch("/me", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);

export default router;
