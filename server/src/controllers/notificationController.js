import Notification from "../models/Notification.js";

export const notificationController = {
    // Get all notifications for the current user
    getUserNotifications: async (req, res) => {
        try {
            const notifications = await Notification.find({ user: req.user.userId })
                .sort({ createdAt: -1 }) // Newest first
                .limit(20);
            res.json(notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ message: "Server error fetching notifications" });
        }
    },

    // Mark a notification as read
    markAsRead: async (req, res) => {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: req.params.id, user: req.user.userId },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ message: "Notification not found" });
            }

            res.json(notification);
        } catch (error) {
            console.error("Error updating notification:", error);
            res.status(500).json({ message: "Server error updating notification" });
        }
    },
};
