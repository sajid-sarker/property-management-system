import mongoose from "mongoose";
import PropertyBid from "../models/PropertyBid.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

/**
 * Place a bid on a property
 * POST /api/property-bids/property/:propertyId
 * 
 * Race Condition Prevention:
 * - Uses findOneAndUpdate with atomic operations
 * - Checks property status before creating bid
 * - Only allows pending bids on available/bidding properties
 */
export const placeBid = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { bidAmount, message } = req.body;
        const bidderId = req.user._id;

        // Validate property exists
        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ success: false, message: "Invalid Property Id" });
        }

        // Use findOneAndUpdate for atomic check-and-update to prevent race conditions
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Check if property is for sale and biddable
        if (property.listingType !== "sell") {
            return res.status(400).json({
                success: false,
                message: "Bidding is only available for properties listed for sale"
            });
        }

        if (!property.isBiddable) {
            return res.status(400).json({
                success: false,
                message: "This property is not accepting bids"
            });
        }

        // Check property status - prevent bidding on sold properties (race condition check)
        if (property.status === "sold" || property.status === "rented") {
            return res.status(400).json({
                success: false,
                message: "This property is no longer available"
            });
        }

        // Prevent bidding on own property
        if (property.landlord && property.landlord.toString() === bidderId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot bid on your own property"
            });
        }

        // Validate bid amount - allow any positive amount (above or below starting price)
        if (!bidAmount || bidAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Bid amount must be a positive number"
            });
        }

        // Check if user already has a pending bid on this property
        const existingBid = await PropertyBid.findOne({
            property: propertyId,
            bidder: bidderId,
            status: "pending"
        });

        if (existingBid) {
            // Update existing bid instead of creating new one
            existingBid.bidAmount = bidAmount;
            existingBid.message = message || existingBid.message;
            await existingBid.save();

            // Update property current price if this bid is the new highest
            const highestBid = await PropertyBid.findOne({ property: propertyId, status: "pending" })
                .sort({ bidAmount: -1 });

            if (highestBid) {
                await Property.findByIdAndUpdate(propertyId, {
                    currentPrice: highestBid.bidAmount,
                    status: "bidding"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Bid updated successfully",
                data: existingBid
            });
        }

        // Create new bid (keep all existing pending bids - no outbid logic)
        const newBid = new PropertyBid({
            bidAmount,
            bidder: bidderId,
            property: propertyId,
            status: "pending",
            message: message || ""
        });

        await newBid.save();

        // Update property current price to highest bid
        const highestBid = await PropertyBid.findOne({ property: propertyId, status: "pending" })
            .sort({ bidAmount: -1 });

        await Property.findByIdAndUpdate(propertyId, {
            currentPrice: highestBid ? highestBid.bidAmount : property.startingPrice,
            status: "bidding"
        });

        // Notify landlord - include propertyBidId for accept action
        if (property.landlord) {
            const bidderName = req.user.name || "A user";
            await Notification.create({
                user: property.landlord,
                message: `${bidderName} placed a bid of $${bidAmount} on your property: "${property.title}"`,
                type: 'bid_received',
                relatedId: property._id,        // Property ID for navigation
                propertyBidId: newBid._id,      // PropertyBid ID for accept action
                isRead: false
            });
        }

        res.status(201).json({
            success: true,
            message: "Bid placed successfully",
            data: newBid
        });

    } catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Get all bids for a property (landlord only)
 * GET /api/property-bids/property/:propertyId
 */
export const getBidsForProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ success: false, message: "Invalid Property Id" });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Only landlord can view bids
        if (!property.landlord || property.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view bids for this property"
            });
        }

        const bids = await PropertyBid.find({ property: propertyId })
            .populate("bidder", "name email image phoneNumber")
            .sort({ bidAmount: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: bids,
            totalBids: bids.length,
            highestBid: bids.length > 0 ? bids[0].bidAmount : null
        });

    } catch (error) {
        console.error("Error fetching bids:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Get current user's bids
 * GET /api/property-bids/my-bids
 */
export const getMyBids = async (req, res) => {
    try {
        const bids = await PropertyBid.find({ bidder: req.user._id })
            .populate("property", "title images address price currentPrice status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: bids
        });

    } catch (error) {
        console.error("Error fetching user bids:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Get public bid history for a property
 * GET /api/property-bids/history/:propertyId
 * 
 * Returns bid history without sensitive bidder info for public viewing
 */
export const getBidHistory = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ success: false, message: "Invalid Property Id" });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Get all bids for this property (public view - limited bidder info)
        const bids = await PropertyBid.find({ property: propertyId })
            .populate("bidder", "name image") // Only show name and image
            .select("bidId bidAmount status createdAt") // Limited fields
            .sort({ createdAt: -1 });

        // Calculate statistics
        const pendingBids = bids.filter(b => b.status === "pending");
        const highestPendingBid = pendingBids.length > 0
            ? Math.max(...pendingBids.map(b => b.bidAmount))
            : null;
        const lowestPendingBid = pendingBids.length > 0
            ? Math.min(...pendingBids.map(b => b.bidAmount))
            : null;

        res.status(200).json({
            success: true,
            data: {
                propertyId: property._id,
                propertyTitle: property.title,
                startingPrice: property.startingPrice,
                currentPrice: property.currentPrice,
                status: property.status,
                bids: bids,
                statistics: {
                    totalBids: bids.length,
                    pendingBids: pendingBids.length,
                    highestPendingBid,
                    lowestPendingBid
                }
            }
        });

    } catch (error) {
        console.error("Error fetching bid history:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Accept a bid (landlord only)
 * PATCH /api/property-bids/:bidId/accept
 * 
 * Race Condition Prevention:
 * - Checks if property already sold before accepting
 * - Uses atomic update to change bid status
 * - Ensures only one bid can be accepted per property
 */
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await PropertyBid.findById(bidId).populate("property");
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        const property = bid.property;

        // Race condition check: Verify property hasn't already been sold
        if (property.status === "sold") {
            return res.status(400).json({
                success: false,
                message: "Property has already been sold. Another bid was accepted."
            });
        }

        // Check if there's already an accepted bid for this property
        const existingAcceptedBid = await PropertyBid.findOne({
            property: property._id,
            status: "accepted"
        });

        if (existingAcceptedBid) {
            return res.status(400).json({
                success: false,
                message: "A bid has already been accepted for this property"
            });
        }

        // Only landlord can accept bids
        if (!property.landlord || property.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to accept bids for this property"
            });
        }

        if (bid.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Cannot accept a bid that is ${bid.status}`
            });
        }

        // Use atomic findOneAndUpdate to prevent race conditions
        // Only update if status is still pending
        const updatedBid = await PropertyBid.findOneAndUpdate(
            { _id: bidId, status: "pending" },
            { status: "accepted" },
            { new: true }
        );

        if (!updatedBid) {
            return res.status(400).json({
                success: false,
                message: "Bid status has changed. Please refresh and try again."
            });
        }

        // Reject all other pending bids for this property
        const rejectedBids = await PropertyBid.find({
            property: property._id,
            _id: { $ne: bidId },
            status: "pending"
        });

        await PropertyBid.updateMany(
            { property: property._id, _id: { $ne: bidId }, status: "pending" },
            { status: "rejected" }
        );

        // Update property status to sold atomically
        await Property.findOneAndUpdate(
            { _id: property._id, status: { $ne: "sold" } },
            { status: "sold", currentPrice: bid.bidAmount, isBiddable: false }
        );

        // Notify the winning bidder
        await Notification.create({
            user: bid.bidder,
            message: `Congratulations! Your bid of $${bid.bidAmount} on "${property.title}" has been accepted!`,
            type: 'bid_accepted',
            relatedId: property._id,
            isRead: false
        });

        // Notify rejected bidders
        for (const rejectedBid of rejectedBids) {
            await Notification.create({
                user: rejectedBid.bidder,
                message: `Your bid of $${rejectedBid.bidAmount} on "${property.title}" was not selected. The property has been sold.`,
                type: 'bid_rejected',
                relatedId: property._id,
                isRead: false
            });
        }

        res.status(200).json({
            success: true,
            message: "Bid accepted successfully",
            data: updatedBid
        });

    } catch (error) {
        console.error("Error accepting bid:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Reject a bid (landlord only)
 * PATCH /api/property-bids/:bidId/reject
 */
export const rejectBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await PropertyBid.findById(bidId).populate("property");
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        const property = bid.property;

        // Only landlord can reject bids
        if (!property.landlord || property.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to reject bids for this property"
            });
        }

        if (bid.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Cannot reject a bid that is ${bid.status}`
            });
        }

        bid.status = "rejected";
        await bid.save();

        // Notify the bidder
        await Notification.create({
            user: bid.bidder,
            message: `Your bid of $${bid.bidAmount} on "${property.title}" has been rejected.`,
            type: 'bid_rejected',
            relatedId: property._id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            message: "Bid rejected successfully",
            data: bid
        });

    } catch (error) {
        console.error("Error rejecting bid:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Withdraw own bid
 * DELETE /api/property-bids/:bidId
 */
export const withdrawBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await PropertyBid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        // Only bid owner can withdraw
        if (bid.bidder.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to withdraw this bid"
            });
        }

        if (bid.status === "accepted") {
            return res.status(400).json({
                success: false,
                message: "Cannot withdraw an accepted bid"
            });
        }

        await PropertyBid.findByIdAndDelete(bidId);

        res.status(200).json({
            success: true,
            message: "Bid withdrawn successfully"
        });

    } catch (error) {
        console.error("Error withdrawing bid:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
