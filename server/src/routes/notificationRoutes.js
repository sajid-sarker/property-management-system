import express from "express";
import { notificationController } from "../controllers/notificationController.js";
import { protect as auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get("/", notificationController.getUserNotifications);
router.put("/:id/read", notificationController.markAsRead);

export default router;
