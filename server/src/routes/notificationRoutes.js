import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
router.get("/", protect, async (req, res) => {
    try {
        console.log("GET /api/notifications hit by user:", req.user?._id || req.user?.id);

        // Ensure we have a valid user ID
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        if (!userId) {
            console.error("No user ID found in request object");
            return res.status(401).json({ message: "User not authenticated" });
        }

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`Found ${notifications.length} notifications`);
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put("/:id/read", protect, async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
