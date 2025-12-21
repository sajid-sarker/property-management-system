import mongoose from "mongoose";
import Property from "../models/Property.js";

export const getProperties = async (req, res) => {
  try {
    // Sort by priority descending (boosted properties first), then by createdAt
    const properties = await Property.find({}).sort({ priority: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.log("Error fetching properties:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Property Id",
      });
    }

    const property = await Property.findById(id).populate("landlord", "name email");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.log("Error fetching property:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createProperty = async (req, res) => {
  const property = req.body; // user will send this data

  if (!property.title || !property.description || !property.price || !property.images) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields (title, description, price, images)" });
  }

  const newProperty = new Property(property);

  try {
    await newProperty.save();
    res.status(201).json({ success: true, data: newProperty });
  } catch (error) {
    console.error("Error in Create property:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
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
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Strict ownership verification
    // req.user must be populated by auth middleware
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Property deleted" });
  } catch (error) {
    console.log("error in deleting property:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const searchProperties = async (req, res) => {
  try {
    const { title, street, city, state, type } = req.query;

    // 1. Construct Primary Filter (Strict match for all provided fields)
    const primaryFilter = {};

    if (title) primaryFilter.title = { $regex: title, $options: "i" };
    if (type) primaryFilter.type = type;

    // Address fields - strict structure match
    if (street) primaryFilter["address.street"] = { $regex: street, $options: "i" };
    if (city) primaryFilter["address.city"] = { $regex: city, $options: "i" };
    if (state) primaryFilter["address.state"] = { $regex: state, $options: "i" };

    // Execute Primary Query
    const primaryResults = await Property.find(primaryFilter).sort({ priority: -1, createdAt: -1 });

    // 2. Construct Nearby Filter (If City is provided)
    let nearbyResults = [];
    if (city) {
      const primaryIds = primaryResults.map(p => p._id);

      const nearbyFilter = {
        "address.city": { $regex: city, $options: "i" },
        _id: { $nin: primaryIds } // Exclude already found properties
      };

      nearbyResults = await Property.find(nearbyFilter).sort({ priority: -1, createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: {
        primary: primaryResults,
        nearby: nearbyResults
      }
    });

  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

