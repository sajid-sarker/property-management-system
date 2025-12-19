import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

const bidSchema = new mongoose.Schema(
  {
    bidId: {
      type: String,
      unique: true,
      required: true,
    },

    amount: { type: Number, required: true },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

bidSchema.plugin(autoIncrement, {
  model: "Bid",
  field: "bidId",
  prefix: "BID-",
  padLength: 6,
});

const Bid = mongoose.model("Bid", bidSchema);

export default Bid;
