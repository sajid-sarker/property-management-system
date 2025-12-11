import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

const app = express();

app.use(express.json()); // Allows us to use JSON data in req.body

app.use("/api/products", propertyRoutes);

app.listen(5000, () => {
  connectDB();
  console.log("Server started at http://localhost:5000");
});
