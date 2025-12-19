import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
      required: true,
    },
    images: {
      images: [String],
      required: true,
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
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },

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
