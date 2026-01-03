import mongoose from "mongoose";
import autoIncrement from "../utils/autoIncrement.js";

/**
 * Bid Model
 * Represents a company's bid on a development project
 * Features 3 & 4 of Requirement 1: Bid management for real estate companies
 */
const bidSchema = new mongoose.Schema(
    {
        bidId: {
            type: String,
            unique: true,
        },
        // Reference to the project being bid on
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        // Company that placed the bid
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Bid amount in currency
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        // Proposal description
        proposalText: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        // Estimated completion timeline (in days)
        estimatedDays: {
            type: Number,
            default: 0,
        },
        // Bid status
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "withdrawn"],
            default: "pending",
        },
        // Optional deadline for this specific bid (if project has one)
        deadline: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Auto-increment plugin for bidId
bidSchema.plugin(autoIncrement, {
    field: "bidId",
    prefix: "BID-",
    padLength: 6,
});

// Check if bid can be modified (before deadline and not accepted/rejected)
bidSchema.methods.canModify = function () {
    if (this.status === "accepted" || this.status === "rejected" || this.status === "withdrawn") {
        return false;
    }
    if (this.deadline && new Date() > this.deadline) {
        return false;
    }
    return true;
};

const Bid = mongoose.model("Bid", bidSchema);

export default Bid;
