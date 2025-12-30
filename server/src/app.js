import express from "express";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import boostRoutes from "./routes/boostRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
// [NEW] Notification Routes
import notificationRoutes from "./routes/notificationRoutes.js";
// [NEW] Property Bid Routes (for property sale bidding)
import propertyBidRoutes from "./routes/propertyBidRoutes.js";
// [NEW] Message Routes
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/users", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", bidRoutes); // Bids are often sub-resources or root
// [NEW] Mount Notifications
app.use("/api/notifications", notificationRoutes);
// [NEW] Property Bids (for property sale bidding)
app.use("/api/property-bids", propertyBidRoutes);
// [NEW] Mount Messages
app.use("/api/messages", messageRoutes);

export default app;