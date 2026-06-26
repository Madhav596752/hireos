// src/modules/messages/messages.routes.js
import { Router } from "express";
import * as messagesController from "./messages.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/conversations", messagesController.getConversations);
router.get("/team", messagesController.getTeamMembers);
router.get("/:withUserId", messagesController.getMessages);
router.post("/", messagesController.sendMessage);

export default router;
