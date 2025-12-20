import mongoose from "mongoose";
import Boost from "../models/Boost.js";
import Property from "../models/Property.js";

// @desc    Create a new boost for a property
// @route   POST /api/boosts
export const createBoost = async (req, res) => {
    try {
        const { propertyId, landlordId, duration, amount, paymentMethod } = req.body;

        // Validate required fields (landlordId optional since auth not implemented)
        if (!propertyId || !duration || !amount) {
            return res.status(400).json({
                success: false,
                message: "Please provide propertyId, duration, and amount",
            });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        // Calculate end date based on duration (in days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        // Create the boost
        const newBoost = new Boost({
            property: propertyId,
            landlord: landlordId,
            amount,
            duration,
            startDate,
            endDate,
            paymentMethod: paymentMethod || "card",
            status: "active",
        });

        await newBoost.save();

        // Update property priority (boosted properties get higher priority)
        // Priority: 1 = normal, 2+ = boosted (higher = more boosted)
        await Property.findByIdAndUpdate(propertyId, {
            priority: duration >= 30 ? 3 : 2, // 30+ days get priority 3, others get 2
        });

        res.status(201).json({
            success: true,
            message: "Property boosted successfully!",
            data: newBoost,
        });
    } catch (error) {
        console.error("Error creating boost:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Get all boosts for a landlord
// @route   GET /api/boosts/landlord/:landlordId
export const getBoostsByLandlord = async (req, res) => {
    try {
        const { landlordId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(landlordId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid landlord ID",
            });
        }

        const boosts = await Boost.find({ landlord: landlordId })
            .populate("property")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: boosts,
        });
    } catch (error) {
        console.error("Error fetching boosts:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Get all active boosts
// @route   GET /api/boosts/active
export const getActiveBoosts = async (req, res) => {
    try {
        const activeBoosts = await Boost.find({
            status: "active",
            endDate: { $gt: new Date() },
        }).populate("property");

        res.status(200).json({
            success: true,
            data: activeBoosts,
        });
    } catch (error) {
        console.error("Error fetching active boosts:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Cancel a boost
// @route   DELETE /api/boosts/:id
export const cancelBoost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid boost ID",
            });
        }

        const boost = await Boost.findById(id);

        if (!boost) {
            return res.status(404).json({
                success: false,
                message: "Boost not found",
            });
        }

        // Update boost status
        boost.status = "cancelled";
        await boost.save();

        // Reset property priority
        await Property.findByIdAndUpdate(boost.property, {
            priority: 1,
        });

        res.status(200).json({
            success: true,
            message: "Boost cancelled successfully",
        });
    } catch (error) {
        console.error("Error cancelling boost:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Get boost pricing options
// @route   GET /api/boosts/pricing
export const getBoostPricing = async (req, res) => {
    try {
        const pricingOptions = [
            {
                id: "boost-7",
                duration: 7,
                price: 29.99,
                label: "7 Days",
                description: "Get 2x more visibility for a week",
            },
            {
                id: "boost-30",
                duration: 30,
                price: 49.99,
                label: "30 Days",
                description: "Premium visibility for a full month",
                popular: true,
            },
            {
                id: "boost-90",
                duration: 90,
                price: 99.99,
                label: "90 Days",
                description: "Maximum exposure for 3 months",
            },
        ];

        res.status(200).json({
            success: true,
            data: pricingOptions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
