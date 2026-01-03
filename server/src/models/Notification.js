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
      enum: ['bid_received', 'bid_accepted', 'bid_rejected', 'general', 'price_change'],
      default: 'general'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
