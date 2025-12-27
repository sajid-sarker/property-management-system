import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    placeBid,
    getBidsForProperty,
    getBidHistory,
    getMyBids,
    acceptBid,
    rejectBid,
    withdrawBid,
} from "../controllers/propertyBidController.js";

const router = express.Router();

// Get current user's bids (must be before /:bidId routes)
router.get("/my-bids", protect, getMyBids);

// Place a bid on a property
router.post("/property/:propertyId", protect, placeBid);

// Get all bids for a property (landlord only - full details)
router.get("/property/:propertyId", protect, getBidsForProperty);

// Get public bid history for a property (no auth - limited info)
router.get("/history/:propertyId", getBidHistory);

// Accept a bid (landlord only)
router.patch("/:bidId/accept", protect, acceptBid);

// Reject a bid (landlord only)
router.patch("/:bidId/reject", protect, rejectBid);

// Withdraw own bid
router.delete("/:bidId", protect, withdrawBid);

export default router;

