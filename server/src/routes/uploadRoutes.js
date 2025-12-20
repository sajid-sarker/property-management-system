import express from "express";
import { uploadFile } from "../controllers/uploadController.js";
import upload from "../utils/upload.js";

const router = express.Router();

// POST /api/upload
router.post("/", upload.single("image"), uploadFile);

export default router;
