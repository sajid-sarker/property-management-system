import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// For user buying/renting

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pricePaid: Number,

    type: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.plugin(autoIncrement, {
  model: "Order",
  field: "orderId",
  prefix: "TXN-",
  padLength: 6,
});

Order = mongoose.model("Order", orderSchema);
export default Order;
