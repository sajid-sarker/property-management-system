import Project from "../models/Project.js";
import Bid from "../models/Bid.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

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
        const project = await Project.findById(projectId).populate("owner", "name email");
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

        // Populate company info for response and notification
        await bid.populate("company", "name email");

        // Create notification for the landlord (project owner)
        if (project.owner) {
            const companyName = bid.company?.name || "A company";
            const notificationMessage = `New bid received on "${project.title}": $${amount.toLocaleString()} by ${companyName}`;

            await Notification.create({
                user: project.owner._id,
                message: notificationMessage,
                type: "bid_received",
                relatedId: bid._id,
                bidId: bid._id,
                projectId: project._id,
                isRead: false,
            });
        }

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

// @desc    Accept a bid on a project (landlord only)
// @route   PATCH /api/projects/:id/bid/:bidId/accept
// @access  Private (Owner/Landlord)
export const acceptBid = async (req, res) => {
    try {
        const { id: projectId, bidId } = req.params;
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        // Find the project and verify ownership
        const project = await Project.findById(projectId).populate("owner", "name email");
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Verify the user is the project owner
        if (project.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized - only the project owner can accept bids" });
        }

        // Find the bid
        const bid = await Bid.findById(bidId).populate("company", "name email");
        if (!bid) {
            return res.status(404).json({ success: false, message: "Bid not found" });
        }

        // Verify bid belongs to this project
        if (bid.project.toString() !== projectId.toString()) {
            return res.status(400).json({ success: false, message: "Bid does not belong to this project" });
        }

        // Check if bid can still be accepted
        if (bid.status !== "pending") {
            return res.status(400).json({ success: false, message: `Cannot accept bid - bid status is ${bid.status}` });
        }

        // Update bid status to accepted
        bid.status = "accepted";
        await bid.save();

        // Update project status to InProgress and set selectedCompany
        project.status = "InProgress";
        project.selectedCompany = bid.company._id;
        await project.save();

        // Reject all other pending bids on this project
        await Bid.updateMany(
            { project: projectId, _id: { $ne: bidId }, status: "pending" },
            { status: "rejected" }
        );

        // Create notification for the company (bid owner) that their bid was accepted
        const companyName = bid.company?.name || "Company";
        await Notification.create({
            user: bid.company._id,
            message: `Congratulations! Your bid of $${bid.amount.toLocaleString()} on "${project.title}" has been accepted.`,
            type: "bid_accepted",
            relatedId: project._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            message: "Bid accepted successfully",
            data: {
                project: {
                    _id: project._id,
                    title: project.title,
                    status: project.status,
                },
                acceptedBid: {
                    _id: bid._id,
                    amount: bid.amount,
                    company: bid.company,
                    proposalText: bid.proposalText,
                },
            },
        });
    } catch (error) {
        console.error("Error accepting bid:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

// @desc    Get landlord's under development projects
// @route   GET /api/projects/under-development
// @access  Private (Landlord)
export const getUnderDevelopmentProjects = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        // Find all projects owned by this landlord that are InProgress
        const projects = await Project.find({
            owner: userId,
            status: "InProgress",
        })
            .populate("selectedCompany", "name email")
            .populate({
                path: "bids",
                match: { status: "accepted" },
                populate: { path: "company", select: "name email" },
            })
            .sort({ updatedAt: -1 });

        // Map projects to include accepted bid info
        const projectsWithBids = projects.map((project) => {
            const acceptedBid = project.bids.find((b) => b.status === "accepted");
            return {
                _id: project._id,
                projectId: project.projectId,
                title: project.title,
                description: project.description,
                location: project.location,
                address: project.address,
                status: project.status,
                images: project.images,
                acceptedBid: acceptedBid
                    ? {
                        _id: acceptedBid._id,
                        amount: acceptedBid.amount,
                        proposalText: acceptedBid.proposalText,
                        estimatedDays: acceptedBid.estimatedDays,
                        company: acceptedBid.company,
                    }
                    : null,
                selectedCompany: project.selectedCompany,
                updatedAt: project.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            count: projectsWithBids.length,
            data: projectsWithBids,
        });
    } catch (error) {
        console.error("Error fetching under development projects:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get single under development project with bid details
// @route   GET /api/projects/under-development/:id
// @access  Private (Landlord)
export const getUnderDevelopmentProjectById = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const projectId = req.params.id;

        const project = await Project.findById(projectId)
            .populate("owner", "name email")
            .populate("selectedCompany", "name email")
            .populate({
                path: "bids",
                match: { status: "accepted" },
                populate: { path: "company", select: "name email" },
            });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // Verify the user is the project owner
        if (project.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const acceptedBid = project.bids.find((b) => b.status === "accepted");

        res.status(200).json({
            success: true,
            data: {
                _id: project._id,
                projectId: project.projectId,
                title: project.title,
                description: project.description,
                location: project.location,
                address: project.address,
                budget: project.budget,
                status: project.status,
                images: project.images,
                acceptedBid: acceptedBid
                    ? {
                        _id: acceptedBid._id,
                        amount: acceptedBid.amount,
                        proposalText: acceptedBid.proposalText,
                        estimatedDays: acceptedBid.estimatedDays,
                        company: acceptedBid.company,
                        createdAt: acceptedBid.createdAt,
                    }
                    : null,
                selectedCompany: project.selectedCompany,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching under development project:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
