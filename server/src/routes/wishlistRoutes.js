import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateNotes,
  checkInWishlist,
} from "../controllers/wishlistController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get("/", getWishlist);

// Check if property is in wishlist
router.get("/check/:propertyId", checkInWishlist);

// Add property to wishlist
router.post("/add", addToWishlist);

// Remove property from wishlist
router.delete("/:propertyId", removeFromWishlist);

// Update notes for a wishlist item
router.put("/:propertyId/notes", updateNotes);

export default router;
