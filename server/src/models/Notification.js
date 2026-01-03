import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    type: {
      type: String,
      enum: ['bid_received', 'bid_accepted', 'bid_rejected', 'general'],
      default: 'general'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    // Additional fields for bid notifications
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      required: false
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

