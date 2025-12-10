import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
// import Property from "./models/Property.js";

dotenv.config();

const app = express();

// app.post("/properties", async(req, res) => {
//     const property = req.body; // Users will send this data

// });

app.listen(5000, () => {
  connectDB();
  console.log("Server started at http://localhost:5000");
});
