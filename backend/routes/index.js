import express from "express";
import auth from "../middleware/auth.js";
import { login } from "../controllers/authController.js";
import { startConversation } from "../controllers/conversationController.js";
import { chat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/conversations/start", auth, startConversation);
router.post("/chat", auth, chat);

export default router;
