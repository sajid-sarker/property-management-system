import express from "express";

import { protect as verifyUser } from "../middlewares/authMiddleware.js";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  searchProperties,
  markInterested,
  addReview,
  getPropertyReviews
} from "../controllers/propertyController.js";

const router = express.Router();

// --- NOTIFICATION ROUTES (Moved here temporarily) ---
import Notification from "../models/Notification.js";

router.get("/notifications/mine", verifyUser, async (req, res) => {
  try {
    console.log("Hit temporary notification route!");
    const userId = req.user._id || req.user.userId || req.user.id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    console.log(`Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// ----------------------------------------------------

// Search route must be before /:id to prevent "search" being treated as an id
router.get("/search", searchProperties);

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.get("/:id/reviews", getPropertyReviews); // Get reviews for a property

// Protected routes
router.post("/", verifyUser, createProperty);
router.put("/:id", verifyUser, updateProperty);
router.delete("/:id", verifyUser, deleteProperty);
router.post("/:id/interested", verifyUser, markInterested);
router.post("/:id/review", verifyUser, addReview); // Add review to property

export default router;

