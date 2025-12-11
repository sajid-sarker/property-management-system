import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

// Project schema for development requests
const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
    },
    title: String,
    description: String,
    location: String,
    budget: Number,
    deadline: Date,

    // Reference to owner who posted
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
