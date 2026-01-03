import Project from "../models/Project.js";
import Bid from "../models/Bid.js";

/**
 * Project Controller
 * Handles development projects and company bids
 * Features 3 & 4 of Requirement 1: Bid management for real estate companies
 */

// @desc    Get all development projects
// @route   GET /api/projects
// @access  Public
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("owner", "name email")
            .populate("selectedCompany", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get single project by ID with bids
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("owner", "name email")
            .populate("selectedCompany", "name email")
            .populate({
                path: "bids",
                populate: { path: "company", select: "name email" },
            });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Create a new development project
// @route   POST /api/projects
// @access  Private (Owner/Landlord)
export const createProject = async (req, res) => {
    try {
        const { title, description, budget, address, images, deadline, location, status } = req.body;

        const userId = req.user?._id || req.user?.id || req.user?.userId;

        const project = await Project.create({
            title,
            description,
            budget,
            address,
            images: images || [],
            deadline,
            location,
            status: status || "Open",
            owner: userId,
        });

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// @desc    Place a bid on a project
// @route   POST /api/projects/:id/bid
// @access  Private (Company)
export const placeBid = async (req, res) => {
    try {
        const { amount, proposalText, estimatedDays } = req.body;
        const projectId = req.params.id;
        const companyId = req.user?._id || req.user?.id || req.user?.userId;

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Check if company already has a bid on this project
        const existingBid = await Bid.findOne({ project: projectId, company: companyId, status: { $ne: "withdrawn" } });
        if (existingBid) {
            return res.status(400).json({ success: false, message: "You already have an active bid on this project" });
        }

        // Create bid
        const bid = await Bid.create({
            project: projectId,
            company: companyId,
            amount,
            proposalText,
            estimatedDays: estimatedDays || 0,
            deadline: project.deadline,
        });

        // Add bid to project's bids array
        project.bids.push(bid._id);
        await project.save();

        // Populate company info for response
        await bid.populate("company", "name email");

        res.status(201).json({ success: true, message: "Bid placed successfully", data: bid });
    } catch (error) {
        console.error("Error placing bid:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// @desc    Update a bid (Feature 3: Modify bid before deadline)
// @route   PUT /api/projects/:id/bid/:bidId
// @access  Private (Company - owner of bid)
export const updateBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        const { amount, proposalText, estimatedDays } = req.body;
        const companyId = req.user?._id || req.user?.id || req.user?.userId;

        // Find the bid
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        // Check if user owns this bid
        if (bid.company.toString() !== companyId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to modify this bid" });
        }

        // Check if bid can be modified (deadline not passed, status still pending)
        if (!bid.canModify()) {
            return res.status(400).json({
                success: false,
                message: "Cannot modify bid - either deadline has passed or bid is no longer pending"
            });
        }

        // Update bid fields
        if (amount !== undefined) bid.amount = amount;
        if (proposalText !== undefined) bid.proposalText = proposalText;
        if (estimatedDays !== undefined) bid.estimatedDays = estimatedDays;

        await bid.save();
        await bid.populate("company", "name email");

        res.status(200).json({ success: true, message: "Bid updated successfully", data: bid });
    } catch (error) {
        console.error("Error updating bid:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// @desc    Withdraw a bid (Feature 3: Withdraw bid before deadline)
// @route   DELETE /api/projects/:id/bid/:bidId
// @access  Private (Company - owner of bid)
export const withdrawBid = async (req, res) => {
    try {
        const { id: projectId, bidId } = req.params;
        const companyId = req.user?._id || req.user?.id || req.user?.userId;

        // Find the bid
        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        // Check if user owns this bid
        if (bid.company.toString() !== companyId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to withdraw this bid" });
        }

        // Check if bid can be modified
        if (!bid.canModify()) {
            return res.status(400).json({
                success: false,
                message: "Cannot withdraw bid - either deadline has passed or bid is no longer pending"
            });
        }

        // Update bid status to withdrawn
        bid.status = "withdrawn";
        await bid.save();

        // Remove bid from project's bids array
        await Project.findByIdAndUpdate(projectId, {
            $pull: { bids: bidId }
        });

        res.status(200).json({ success: true, message: "Bid withdrawn successfully" });
    } catch (error) {
        console.error("Error withdrawing bid:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// @desc    Get all bids for a project (Feature 4: View other bids)
// @route   GET /api/projects/:id/bids
// @access  Public (or Private depending on requirements)
export const getProjectBids = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Get all non-withdrawn bids for this project
        const bids = await Bid.find({
            project: projectId,
            status: { $ne: "withdrawn" }
        })
            .populate("company", "name email")
            .sort({ amount: 1 }); // Sort by amount ascending

        res.status(200).json({
            success: true,
            count: bids.length,
            data: bids,
        });
    } catch (error) {
        console.error("Error fetching project bids:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get company's own bids
// @route   GET /api/projects/my-bids
// @access  Private (Company)
export const getMyBids = async (req, res) => {
    try {
        const companyId = req.user?._id || req.user?.id || req.user?.userId;

        const bids = await Bid.find({ company: companyId })
            .populate({
                path: "project",
                select: "title budget deadline",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bids.length,
            data: bids,
        });
    } catch (error) {
        console.error("Error fetching my bids:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
