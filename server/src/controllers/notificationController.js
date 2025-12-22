import Notification from "../models/Notification.js";

// Get all notifications for the current user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        console.log("Fetching notifications for user ID:", userId, "Type:", typeof userId);

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 }) // Newest first
            .limit(20);

        console.log(`Found ${notifications.length} notifications for user ${userId}`);
        if (notifications.length === 0) {
            // Debug: find ANY notification to see if DB is empty
            const anyNotif = await Notification.findOne();
            console.log("DEBUG: Sample notification from DB:", anyNotif);
        }

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error fetching notifications" });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
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
        res.status(500).json({ message: "Server error updating notification" });
    }
};
