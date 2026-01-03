import Property from "../models/Property.js";
import Notification from "../models/Notification.js";
import Wishlist from "../models/Wishlist.js";
import Boost from "../models/Boost.js";
import Message from "../models/Message.js";
import PropertyBid from "../models/PropertyBid.js";

/**
 * Get dashboard statistics based on user role
 * @route GET /api/dashboard/stats
 * @access Private
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === "landlord" || userRole === "agent") {
      // Get count of active listings owned by user
      const activeListings = await Property.countDocuments({
        landlord: userId,
        status: { $in: ["available", "bidding"] }
      });

      // Get count of notifications (inquiries about their properties)
      const totalInquiries = await Notification.countDocuments({
        user: userId,
        isRead: false
      });

      // Get count of active boosts
      const boostedListings = await Boost.countDocuments({
        landlord: userId,
        status: "active"
      });

      // Get pending bids on their properties
      const userProperties = await Property.find({ landlord: userId }).select("_id");
      const propertyIds = userProperties.map(p => p._id);
      const pendingBids = await PropertyBid.countDocuments({
        property: { $in: propertyIds },
        status: "pending"
      });

      stats = {
        activeListings,
        totalInquiries,
        boostedListings,
        pendingBids
      };
    } else if (userRole === "tenant" || userRole === "general") {
      // Get count of saved listings (wishlist)
      const wishlistItems = await Wishlist.findOne({ user: userId });
      const savedListings = wishlistItems?.properties?.length || 0;

      // Get unread message count
      const unreadMessages = await Message.countDocuments({
        receiver: userId,
        read: false
      });

      // Get count of bids placed by user
      const myBids = await PropertyBid.countDocuments({
        bidder: userId,
        status: "pending"
      });

      stats = {
        savedListings,
        unreadMessages,
        myBids
      };
    } else if (userRole === "company") {
      // Get count of properties by company
      const activeProjects = await Property.countDocuments({
        landlord: userId,
        status: { $in: ["available", "bidding"] }
      });

      // Get count of units available
      const unitsAvailable = await Property.countDocuments({
        landlord: userId,
        status: "available"
      });

      // Get pending bids on their properties
      const companyProperties = await Property.find({ landlord: userId }).select("_id");
      const propertyIds = companyProperties.map(p => p._id);
      const pendingBids = await PropertyBid.countDocuments({
        property: { $in: propertyIds },
        status: "pending"
      });

      stats = {
        activeProjects,
        unitsAvailable,
        pendingBids
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics"
    });
  }
};
