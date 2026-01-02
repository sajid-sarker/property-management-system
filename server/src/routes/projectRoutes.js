import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    getAllProjects,
    getProjectById,
    createProject,
    placeBid,
    updateBid,
    withdrawBid,
    getProjectBids,
    getMyBids,
} from "../controllers/projectController.js";

const router = express.Router();

/**
 * Project Routes
 * Handles development projects and company bids
 * Features 3 & 4 of Requirement 1
 */

// Get company's own bids (must be before /:id to avoid conflict)
router.get("/my-bids", protect, getMyBids);

// Public routes
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.get("/:id/bids", getProjectBids); // Feature 4: View all bids on a project

// Protected routes (require authentication)
router.post("/", protect, createProject);
router.post("/:id/bid", protect, placeBid);
router.put("/:id/bid/:bidId", protect, updateBid); // Feature 3: Modify bid
router.delete("/:id/bid/:bidId", protect, withdrawBid); // Feature 3: Withdraw bid

export default router;
