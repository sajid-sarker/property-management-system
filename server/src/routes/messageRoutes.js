import express from "express";
import {
  sendMessage,
  getUnreadCount,
  getConversations,
  getMessages,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/messages - Send a new message
router.post("/", sendMessage);

// GET /api/messages/unread-count - Get unread message count
router.get("/unread-count", getUnreadCount);

// GET /api/messages/conversations - Get list of conversations
router.get("/conversations", getConversations);

// GET /api/messages/:userId - Get messages with a specific user
router.get("/:userId", getMessages);

export default router;
