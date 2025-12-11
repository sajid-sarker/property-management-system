import mongoose from "mongoose";
import Property from "../models/Property.js";

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.log();
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createProperty = async (req, res) => {
  const property = req.body; // user will send this data

  if (!property.name || !property.price || !property.image) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newProperty = new Property(property);

  try {
    await newProperty.save();
    res.status(201).json({ success: true, data: newProperty });
  } catch (error) {
    console.error("Error in Create property:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProperty = async (req, res) => {
  const { id } = req.params;

  const property = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Property Id" });
  }

  try {
    const updatedProperty = await Property.findByIdAndUpdate(id, property, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteProperty = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Property Id" });
  }

  try {
    await Property.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Property deleted" });
  } catch (error) {
    console.log("error in deleting property:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
