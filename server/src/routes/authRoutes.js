import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get('/me', protect, getMe); // middleware protect to be added

export default router;
