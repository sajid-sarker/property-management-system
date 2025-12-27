import mongoose from "mongoose";

import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

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
  console.log("Create Property Request Body:", req.body); // DEBUG
  const property = req.body;

  // Force assignment of landlord from authenticated user if not present or just to be safe
  // The 'protect' middleware guarantees req.user exists
  if (req.user) {
    property.landlord = req.user._id || req.user.userId;
    console.log("Assigned landlord from req.user:", property.landlord);
  }

  if (!property.title || !property.description || !property.price || !property.images) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields (title, description, price, images)" });
  }

  const newProperty = new Property(property);

  try {
    await newProperty.save();
    console.log("Property saved successfully:", newProperty);
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

// [NEW] Mark Interest in Property
export const markInterested = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user._id;

    // 1. Find Property
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // 2. Find authenticated user info (for the message)
    // Assuming req.user is populated with name (if not, we might say "Someone")
    const userName = req.user.name || "A potential tenant/buyer";

    // 3. Create Notification for Landlord
    console.log(`[Interest] Property Landlord ID: ${property.landlord}`);
    console.log(`[Interest] Requesting User ID: ${userId}`);

    if (property.landlord) {
      if (property.landlord.toString() !== userId.toString()) {
        console.log("[Interest] Creating notification document...");

        try {
          const notification = await Notification.create({
            user: property.landlord, // Recipient
            message: `${userName} is interested in your property: "${property.title}"`,
            isRead: false
          });
          console.log("[Interest] Notification SAVED successfully:", notification);
        } catch (saveError) {
          console.error("[Interest] Failed to save notification:", saveError);
        }

      } else {
        console.log("[Interest] Landlord is visiting own property. Notification skipped.");
      }
    } else {
      console.error("[Interest] CRITICAL: Property has no landlord field! Notification cannot be sent.");
    }

    res.status(200).json({ success: true, message: "Interest marked successfully" });
  } catch (error) {
    console.error("Error marking interest:", error);
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

// [NEW] Add Review to Property - Feature 4 of Requirement 3
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id || req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Find property
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Property Id" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if user already reviewed this property
    const existingReview = property.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
      existingReview.createdAt = Date.now();
    } else {
      // Add new review
      property.reviews.push({
        user: userId,
        rating,
        comment: comment || "",
        createdAt: Date.now(),
      });
    }

    // Calculate new average rating
    const totalRatings = property.reviews.reduce((sum, r) => sum + r.rating, 0);
    property.averageRating = (totalRatings / property.reviews.length).toFixed(1);

    await property.save();

    // Populate user info for the response
    await property.populate("reviews.user", "name image");

    res.status(200).json({
      success: true,
      message: existingReview ? "Review updated successfully" : "Review added successfully",
      data: {
        reviews: property.reviews,
        averageRating: property.averageRating
      }
    });

  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// [NEW] Get Reviews for Property
export const getPropertyReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Property Id" });
    }

    const property = await Property.findById(id)
      .select("reviews averageRating")
      .populate("reviews.user", "name image");

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews: property.reviews,
        averageRating: property.averageRating,
        totalReviews: property.reviews.length
      }
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
