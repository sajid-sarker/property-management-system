import mongoose from "mongoose";

import Property from "../models/Property.js";
import PropertyBid from "../models/PropertyBid.js";
import Notification from "../models/Notification.js";

export const getProperties = async (req, res) => {
  try {
    const { minPrice, maxPrice, location, minRating } = req.query;

    const filter = {};

    // Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Location Filter (Search in city, state, or street)
    if (location) {
      const locationRegex = { $regex: location, $options: "i" };
      filter.$or = [
        { "address.city": locationRegex },
        { "address.state": locationRegex },
        { "address.street": locationRegex },
      ];
    }

    // Rating Filter
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    // Status Filter (Exact match)
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Listing Type Filter (sell or rent)
    if (req.query.listingType && ['sell', 'rent'].includes(req.query.listingType)) {
      filter.listingType = req.query.listingType;
    }

    // Sort by priority descending (boosted properties first), then by createdAt
    const properties = await Property.find(filter).sort({ priority: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.log("Error fetching properties:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// [NEW] Get landlord's own properties
export const getMyProperties = async (req, res) => {
  try {
    const landlordId = req.user._id;

    const properties = await Property.find({ landlord: landlordId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    console.log("Error fetching landlord properties:", error.message);
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

  // Basic required fields validation
  if (!property.title || !property.description || !property.images) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields (title, description, images)" });
  }

  // Validate listingType
  const listingType = property.listingType || "rent";
  if (!["sell", "rent"].includes(listingType)) {
    return res.status(400).json({
      success: false,
      message: "listingType must be 'sell' or 'rent'"
    });
  }
  property.listingType = listingType;

  // For SELL listings: startingPrice is required
  if (listingType === "sell") {
    if (!property.startingPrice || property.startingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "startingPrice is required for properties listed for sale"
      });
    }
    // Set currentPrice to startingPrice initially
    property.currentPrice = property.currentPrice || property.startingPrice;
    // Set price field for backward compatibility
    property.price = property.price || property.startingPrice;
  } else {
    // For RENT listings: price (monthly rent) is required
    if (!property.price || property.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "price (monthly rent) is required for rental properties"
      });
    }
    property.currentPrice = property.price;
    // isBiddable should be false for rent listings
    property.isBiddable = false;
  }

  // If isBiddable is true, set status to 'bidding'
  if (property.isBiddable && listingType === "sell") {
    property.status = "bidding";
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

  const propertyData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Property Id" });
  }

  try {
    // [NEW] Ownership verification - only landlord can edit
    const existingProperty = await Property.findById(id);

    if (!existingProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Strict ownership verification (if landlord exists and user is authenticated)
    if (existingProperty.landlord && req.user) {
      if (existingProperty.landlord.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to edit this property"
        });
      }
    }

    // Prevent changing listingType after creation (to maintain data integrity)
    if (propertyData.listingType && propertyData.listingType !== existingProperty.listingType) {
      return res.status(400).json({
        success: false,
        message: "Cannot change listingType after property creation. Please delete and recreate the listing."
      });
    }

    // Validate startingPrice update (only for sell listings)
    if (propertyData.startingPrice !== undefined) {
      if (existingProperty.listingType !== "sell") {
        return res.status(400).json({
          success: false,
          message: "startingPrice can only be updated for properties listed for sale"
        });
      }
      if (propertyData.startingPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "startingPrice must be a positive number"
        });
      }
      // Update currentPrice if no bids have been placed yet (currentPrice equals startingPrice)
      if (existingProperty.currentPrice === existingProperty.startingPrice) {
        propertyData.currentPrice = propertyData.startingPrice;
      }
      // Also update price for backward compatibility
      propertyData.price = propertyData.startingPrice;
    }

    // Validate price update (for rent listings)
    if (propertyData.price !== undefined && existingProperty.listingType === "rent") {
      if (propertyData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "price must be a positive number"
        });
      }
      propertyData.currentPrice = propertyData.price;
    }

    // Prevent enabling isBiddable for rent listings
    if (propertyData.isBiddable === true && existingProperty.listingType === "rent") {
      return res.status(400).json({
        success: false,
        message: "Bidding can only be enabled for properties listed for sale"
      });
    }

    // Update bidding status
    if (propertyData.isBiddable === true && existingProperty.listingType === "sell") {
      propertyData.status = "bidding";
    } else if (propertyData.isBiddable === false && existingProperty.status === "bidding") {
      propertyData.status = "available";
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, propertyData, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
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

    // Cascade delete: Remove all bids associated with this property
    const deletedBids = await PropertyBid.find({ property: id });

    // Notify bidders that the listing was cancelled
    for (const bid of deletedBids) {
      if (bid.status === "pending") {
        await Notification.create({
          user: bid.bidder,
          message: `The property listing "${property.title}" has been cancelled by the landlord. Your bid of $${bid.bidAmount} is no longer active.`,
          isRead: false
        });
      }
    }

    await PropertyBid.deleteMany({ property: id });
    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Property and associated bids deleted",
      deletedBidsCount: deletedBids.length
    });
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
            type: 'general',
            relatedId: property._id,
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
