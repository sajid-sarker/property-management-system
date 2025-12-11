import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// Property schema aligned with frontend requirements
const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["house", "apartment", "land", "commercial", "For Sale", "For Rent"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    // Legacy field for frontend compatibility
    location: String,

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    // Property details
    beds: Number,
    baths: Number,
    sqft: String,
    price: String,
    rentPrice: String,
    isForSale: Boolean,
    isForRent: Boolean,

    // Images - single array
    images: [String],
    // Legacy single image for frontend compatibility
    image: String,

    // Boost feature
    isBoosted: {
      type: Boolean,
      default: false
    },

    // Reviews from renters
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
      }
    ],

    // Bids from buyers
    bids: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: Number,
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
      }
    ],

    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

// For generation of Property ID
propertySchema.plugin(autoIncrement, {
  model: "Property",
  field: "propertyId",
  prefix: "PROP-",
  padLength: 6,
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
