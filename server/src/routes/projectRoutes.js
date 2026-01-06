import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    getAllProjects,
    getProjectById,
    createProject,
    deleteProject,
    placeBid,
    updateBid,
    withdrawBid,
    getProjectBids,
    getMyBids,
    acceptBid,
    getUnderDevelopmentProjects,
    getUnderDevelopmentProjectById,
    getCompanyDevelopmentProjects,
    getCompanyProjectById,
} from "../controllers/projectController.js";


const router = express.Router();

/**
 * Project Routes
 * Handles development projects and company bids
 * Features 3 & 4 of Requirement 1
 */

// Get company's own bids (must be before /:id to avoid conflict)
router.get("/my-bids", protect, getMyBids);

// Landlord's under development projects
router.get("/under-development", protect, getUnderDevelopmentProjects);
router.get("/under-development/:id", protect, getUnderDevelopmentProjectById);

// Company's accepted development projects
router.get("/company-projects", protect, getCompanyDevelopmentProjects);
router.get("/company-projects/:id", protect, getCompanyProjectById);


// Public routes
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.get("/:id/bids", getProjectBids); // Feature 4: View all bids on a project

// Protected routes (require authentication)
router.post("/", protect, createProject);
router.delete("/:id", protect, deleteProject); // Delete project
router.post("/:id/bid", protect, placeBid);
router.put("/:id/bid/:bidId", protect, updateBid); // Feature 3: Modify bid
router.delete("/:id/bid/:bidId", protect, withdrawBid); // Feature 3: Withdraw bid
router.patch("/:id/bid/:bidId/accept", protect, acceptBid); // Accept a bid (landlord only)

export default router;

