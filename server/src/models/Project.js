import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
    },
    title: String,
    description: String,

    budget: Number,
    deadline: Date,

    // Reference to owner who posted
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

Project = mongoose.model("Project", projectSchema);

projectSchema.plugin(autoIncrement, {
  model: "Project",
  field: "projectId",
  prefix: "PROJ-",
  padLength: 6,
});

export default Project;
