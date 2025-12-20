import express from "express";

import {
    createBoost,
    getBoostsByLandlord,
    getActiveBoosts,
    cancelBoost,
    getBoostPricing,
} from "../controllers/boostController.js";

const router = express.Router();

// Pricing endpoint (public)
router.get("/pricing", getBoostPricing);

// Get all active boosts
router.get("/active", getActiveBoosts);

// Get boosts by landlord
router.get("/landlord/:landlordId", getBoostsByLandlord);

// Create a new boost
router.post("/", createBoost);

// Cancel a boost
router.delete("/:id", cancelBoost);

export default router;
