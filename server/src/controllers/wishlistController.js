import Wishlist from "../models/Wishlist.js";
import Property from "../models/Property.js";

/**
 * Get current user's wishlist (creates one if doesn't exist)
 * GET /api/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "properties.property",
      populate: {
        path: "landlord",
        select: "name email image",
      },
    });

    // Create empty wishlist if doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [],
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist.properties,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * Add property to wishlist
 * POST /api/wishlist/add
 */
export const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        properties: [],
      });
    }

    // Check if property already in wishlist
    const existingIndex = wishlist.properties.findIndex(
      (item) => item.property.toString() === propertyId
    );

    if (existingIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: "Property already in wishlist",
      });
    }

    // Add property to wishlist
    wishlist.properties.push({
      property: propertyId,
      notes: "",
      addedAt: new Date(),
    });

    await wishlist.save();

    // Populate and return the updated wishlist
    await wishlist.populate({
      path: "properties.property",
      populate: {
        path: "landlord",
        select: "name email image",
      },
    });

    res.status(201).json({
      success: true,
      message: "Property added to wishlist",
      data: wishlist.properties,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
};

/**
 * Remove property from wishlist
 * DELETE /api/wishlist/:propertyId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Find and remove the property
    const propertyIndex = wishlist.properties.findIndex(
      (item) => item.property.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Property not found in wishlist",
      });
    }

    wishlist.properties.splice(propertyIndex, 1);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Property removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
};

/**
 * Update notes for a wishlist item
 * PUT /api/wishlist/:propertyId/notes
 */
export const updateNotes = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Find the property in wishlist
    const propertyItem = wishlist.properties.find(
      (item) => item.property.toString() === propertyId
    );

    if (!propertyItem) {
      return res.status(404).json({
        success: false,
        message: "Property not found in wishlist",
      });
    }

    propertyItem.notes = notes || "";
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
    });
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notes",
      error: error.message,
    });
  }
};

/**
 * Check if a property is in user's wishlist
 * GET /api/wishlist/check/:propertyId
 */
export const checkInWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.properties.some(
      (item) => item.property.toString() === propertyId
    );

    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};
