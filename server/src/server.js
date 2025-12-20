import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import boostRoutes from "./routes/boostRoutes.js";

dotenv.config();

const app = express();

// CORS middleware for frontend communication
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json()); // Allows us to use JSON data in req.body

// API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/boosts", boostRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(5000, () => {
  connectDB();
  console.log("Server started at http://localhost:5000");
});

