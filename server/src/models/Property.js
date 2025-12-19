import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// Main user class. Others will inherit
const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
      required: true,
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
      type: {
        // Define the structure *inside* a 'type' property
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
      },
      required: true, // This makes the entire 'address' field required
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },

    price: {
      type: Number, // Rent or sale
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
    },
    priority: {
      type: Number,
      default: 1, // Boosted => higher value = higher list priority
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
