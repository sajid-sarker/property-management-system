import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // Allows us to use JSON data in req.body

app.use("/api/properties", propertyRoutes);
app.use("/api/users", authRoutes);

app.listen(5000, () => {
  connectDB();
  console.log("Server started at http://localhost:5000");
});
