import express from "express";

import { protect as verifyUser } from "../middlewares/authMiddleware.js";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  searchProperties
} from "../controllers/propertyController.js";

const router = express.Router();

// Search route must be before /:id to prevent "search" being treated as an id
router.get("/search", searchProperties);

router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Protected routes
router.post("/", verifyUser, createProperty);
router.put("/:id", verifyUser, updateProperty);
router.delete("/:id", verifyUser, deleteProperty);

export default router;

