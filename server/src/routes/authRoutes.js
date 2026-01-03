import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    getAllUsers,
    getPublicProfile,
    updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile routes
router.get("/profile/:userId", getPublicProfile);
router.put("/profile/:userId", protect, updateUserProfile);

// Protected routes (require authentication)
router.get("/me", protect, getCurrentUser);
router.get("/", protect, getAllUsers);

export default router;
