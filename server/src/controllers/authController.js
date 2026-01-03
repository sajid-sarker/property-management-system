import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT Secret (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "luxeestate_jwt_secret_key_2024";

// @desc    Register a new user
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "general",
            phoneNumber: phoneNumber || "",
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=0a0a0f`,
            description: "New LuxeEstate member",
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return user data (without password)
        const userResponse = {
            _id: newUser._id,
            userId: newUser.userId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image,
        };

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return user data (without password)
        const userResponse = {
            _id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            landlordInfo: user.landlordInfo,
            companyInfo: user.companyInfo,
        };

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Get public user profile
// @route   GET /api/users/profile/:userId
export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select(
            "name email role image description phoneNumber createdAt landlordInfo companyInfo"
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/:userId
// Limits for MongoDB free tier
const MAX_IMAGE_SIZE_KB = 500;
const MAX_BIO_CHARACTERS = 500;

export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Ensure user can only update their own profile
        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this profile",
            });
        }

        const { name, image, description, phoneNumber } = req.body;
        
        // Validate bio length
        if (description && description.length > MAX_BIO_CHARACTERS) {
            return res.status(400).json({
                success: false,
                message: `Bio must be ${MAX_BIO_CHARACTERS} characters or less`,
            });
        }

        // Validate image size (base64 string)
        if (image && image.startsWith('data:image')) {
            // Base64 is ~33% larger than original, so calculate approximate original size
            const base64Length = image.length - (image.indexOf(',') + 1);
            const approximateSizeKB = (base64Length * 0.75) / 1024;
            
            if (approximateSizeKB > MAX_IMAGE_SIZE_KB) {
                return res.status(400).json({
                    success: false,
                    message: `Image size must be less than ${MAX_IMAGE_SIZE_KB}KB`,
                });
            }
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
