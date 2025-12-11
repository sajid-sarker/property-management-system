import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// User schema with all roles
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
      enum: ["general", "landlord", "company", "tenant", "agent"],
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
      default: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    bio: {
      type: String,
      default: "",
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
    timestamps: true,
  }
);

// For generation of User ID
userSchema.plugin(autoIncrement, {
  model: "User",
  field: "userId",
  prefix: "USER-",
  padLength: 6,
});

const User = mongoose.model("User", userSchema);
export default User;
