import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// Main user class. Others will inherit
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["general", "landlord", "company"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Nothing to say",
    },
    // For landlords (optional)
    landlordInfo: {
      verified: { type: Boolean, default: false },
      listings: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Property",
        },
      ],
    },

    // For companies (optional)
    companyInfo: {
      companyName: String,
      certificates: [String],
      bids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bid",
        },
      ],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// For generation of User ID
userSchema.plugin(autoIncrement, {
  model: "User",
  field: "userId",
  prefix: "USER-",
  padLength: 6,
});

// Creation of the model based on above schema
const User = mongoose.model("User", userSchema);
export default User;
