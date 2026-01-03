import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/stats - Get user dashboard statistics
router.get("/stats", protect, getDashboardStats);

export default router;
