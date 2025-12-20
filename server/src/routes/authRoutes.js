import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    getAllUsers,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/me", protect, getCurrentUser);
router.get("/", protect, getAllUsers);

export default router;
