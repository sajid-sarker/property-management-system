import mongoose from "mongoose";
import PropertyBid from "../models/PropertyBid.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

/**
 * Place a bid on a property
 * POST /api/property-bids/property/:propertyId
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

        // Check property status
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

        // Validate bid amount
        if (!bidAmount || bidAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Bid amount must be a positive number"
            });
        }

        // Check if bid is higher than current price (optional: can be removed for any bid)
        const currentHighest = property.currentPrice || property.startingPrice || property.price;
        if (bidAmount <= currentHighest) {
            return res.status(400).json({
                success: false,
                message: `Bid amount must be higher than current price: ${currentHighest}`
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

            // Update property current price if this is highest bid
            property.currentPrice = bidAmount;
            property.status = "bidding";
            await property.save();

            return res.status(200).json({
                success: true,
                message: "Bid updated successfully",
                data: existingBid
            });
        }

        // Mark previous highest bid as outbid
        await PropertyBid.updateMany(
            { property: propertyId, status: "pending" },
            { status: "outbid" }
        );

        // Create new bid
        const newBid = new PropertyBid({
            bidAmount,
            bidder: bidderId,
            property: propertyId,
            status: "pending",
            message: message || ""
        });

        await newBid.save();

        // Update property current price and status
        property.currentPrice = bidAmount;
        property.status = "bidding";
        await property.save();

        // Notify landlord
        if (property.landlord) {
            const bidderName = req.user.name || "A user";
            await Notification.create({
                user: property.landlord,
                message: `${bidderName} placed a bid of $${bidAmount} on your property: "${property.title}"`,
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
 * Accept a bid (landlord only)
 * PATCH /api/property-bids/:bidId/accept
 */
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await PropertyBid.findById(bidId).populate("property");
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        const property = bid.property;

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

        // Accept this bid
        bid.status = "accepted";
        await bid.save();

        // Reject all other pending bids for this property
        await PropertyBid.updateMany(
            { property: property._id, _id: { $ne: bidId }, status: "pending" },
            { status: "rejected" }
        );

        // Update property status to sold
        await Property.findByIdAndUpdate(property._id, {
            status: "sold",
            currentPrice: bid.bidAmount
        });

        // Notify the winning bidder
        await Notification.create({
            user: bid.bidder,
            message: `Congratulations! Your bid of $${bid.bidAmount} on "${property.title}" has been accepted!`,
            isRead: false
        });

        res.status(200).json({
            success: true,
            message: "Bid accepted successfully",
            data: bid
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
