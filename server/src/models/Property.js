import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

const autoIncrement = require("../utils/autoIncrement.js");
// Main user class. Others will inherit
const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["house", "apartment", "land", "commercial"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      required: true,
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    averageRating: {
      type: Number,
      required: true,
    },
    images: {
      images: [String],
      required: true,
    },

    price: Number,
    rentPrice: Number,
    isForSale: Boolean,
    isForRent: Boolean,

    images: [String],

    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);
// For generation of Property ID
propertySchema.plugin(autoIncrement, {
  model: "Property",
  field: "propertyId",
  prefix: "PROP-",
  padLength: 6,
});

// Creation of the model based on above schema
const Property = mongoose.model("Property", propertySchema);

export default Property;
