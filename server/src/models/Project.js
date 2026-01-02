import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
    },
    images: {
      type: [String],
      default: [],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    // Location string for simpler display
    location: { type: String },
    // Deadline for bidding
    deadline: { type: Date },
    // Status of the project
    status: {
      type: String,
      enum: ["Open", "Closed", "InProgress", "Completed"],
      default: "Open",
    },
    // Optional address object
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    // Reference to owner who posted (optional for now)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // List of bids from companies
    bids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
      },
    ],
    selectedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

projectSchema.plugin(autoIncrement, {
  model: "Project",
  field: "projectId",
  prefix: "PROJ-",
  padLength: 6,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
